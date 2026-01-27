/**
 * Database Health Check Component
 * Monitors database connection status and reports issues
 */

const db = require('../../../config/database');
const logger = require('../../../config/logger');

class DatabaseHealthCheck {
  /**
   * Check database connection health
   * @returns {Promise<Object>} - Health status
   */
  static async check() {
    try {
      const startTime = Date.now();
      
      // Simple connectivity check
      const result = await db.query('SELECT NOW()');
      const responseTime = Date.now() - startTime;

      // Check for table existence
      const tableCheck = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        LIMIT 1
      `);

      return {
        status: 'healthy',
        connected: true,
        responseTime: `${responseTime}ms`,
        tablesExist: tableCheck.rows.length > 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Check table integrity
   * @param {string} tableName - Table to check
   * @returns {Promise<Object>} - Table status
   */
  static async checkTable(tableName) {
    try {
      const result = await db.query(`
        SELECT 
          table_name,
          (SELECT count(*) FROM information_schema.columns 
           WHERE table_name = $1) as column_count,
          (SELECT count(*) FROM ${tableName}) as row_count
        FROM information_schema.tables 
        WHERE table_name = $1
      `, [tableName]);

      if (result.rows.length === 0) {
        return {
          status: 'missing',
          tableName,
        };
      }

      return {
        status: 'exists',
        ...result.rows[0],
      };
    } catch (error) {
      logger.error(`Table check failed for ${tableName}:`, error);
      return {
        status: 'error',
        tableName,
        error: error.message,
      };
    }
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>} - Database stats
   */
  static async getStats() {
    try {
      const tables = await db.query(`
        SELECT 
          table_name,
          (SELECT count(*) FROM information_schema.columns 
           WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public'
      `);

      const rowCounts = {};
      for (const row of tables.rows) {
        try {
          const countResult = await db.query(`SELECT count(*) as count FROM ${row.table_name}`);
          rowCounts[row.table_name] = parseInt(countResult.rows[0].count);
        } catch (e) {
          rowCounts[row.table_name] = null;
        }
      }

      return {
        tableCount: tables.rows.length,
        tables: tables.rows,
        rowCounts,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to get database stats:', error);
      return {
        status: 'error',
        error: error.message,
      };
    }
  }
}

module.exports = DatabaseHealthCheck;
