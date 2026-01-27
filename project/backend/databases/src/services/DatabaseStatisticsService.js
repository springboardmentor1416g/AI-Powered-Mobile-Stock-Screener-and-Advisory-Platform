/**
 * Database Statistics Service
 * Provides detailed database statistics and monitoring
 */

const db = require('../../config/database');
const logger = require('../../config/logger');

class DatabaseStatisticsService {
  /**
   * Get comprehensive database statistics
   * @returns {Promise<Object>} - Database statistics
   */
  static async getComprehensiveStats() {
    try {
      const tables = await this.getTableStats();
      const sizes = await this.getTableSizes();
      const indexes = await this.getIndexStats();
      const connections = await this.getConnectionStats();

      return {
        tables,
        sizes,
        indexes,
        connections,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting comprehensive stats:', error);
      return {
        error: error.message,
      };
    }
  }

  /**
   * Get table statistics
   * @returns {Promise<Array>} - Table stats
   */
  static async getTableStats() {
    try {
      const result = await db.query(`
        SELECT 
          table_name,
          (SELECT count(*) FROM information_schema.columns 
           WHERE table_name = t.table_name) as column_count,
          (SELECT count(*) FROM ${this.escapeTableName('')}${''} 
           LIMIT 1) as estimated_rows
        FROM information_schema.tables t
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

      // Get accurate row counts
      const stats = [];
      for (const row of result.rows) {
        try {
          const countResult = await db.query(
            `SELECT COUNT(*) as count FROM ${this.escapeTableName(row.table_name)}`
          );
          stats.push({
            table: row.table_name,
            columns: row.column_count,
            rows: parseInt(countResult.rows[0].count),
          });
        } catch (e) {
          logger.warn(`Failed to count rows in ${row.table_name}`);
        }
      }

      return stats;
    } catch (error) {
      logger.error('Error getting table stats:', error);
      return [];
    }
  }

  /**
   * Get table sizes
   * @returns {Promise<Array>} - Table sizes
   */
  static async getTableSizes() {
    try {
      const result = await db.query(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `);

      return result.rows;
    } catch (error) {
      logger.error('Error getting table sizes:', error);
      return [];
    }
  }

  /**
   * Get index statistics
   * @returns {Promise<Array>} - Index stats
   */
  static async getIndexStats() {
    try {
      const result = await db.query(`
        SELECT 
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
      `);

      return result.rows;
    } catch (error) {
      logger.error('Error getting index stats:', error);
      return [];
    }
  }

  /**
   * Get connection statistics
   * @returns {Promise<Object>} - Connection stats
   */
  static async getConnectionStats() {
    try {
      const result = await db.query(`
        SELECT 
          count(*) as total_connections,
          max_conn,
          (max_conn - count(*)) as available_connections
        FROM (
          SELECT count(*) as max_conn FROM pg_database WHERE datname = current_database()
        ) db,
        (
          SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()
        ) conn
      `);

      return result.rows[0] || {};
    } catch (error) {
      logger.error('Error getting connection stats:', error);
      return {};
    }
  }

  /**
   * Get slow queries
   * @param {number} limit - Number of queries to retrieve
   * @returns {Promise<Array>} - Slow queries
   */
  static async getSlowQueries(limit = 10) {
    try {
      // Note: Requires log_statement = 'all' in PostgreSQL config
      const result = await db.query(`
        SELECT 
          query,
          calls,
          mean_exec_time,
          total_exec_time
        FROM pg_stat_statements
        ORDER BY mean_exec_time DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      logger.warn('Slow query analysis not available (pg_stat_statements not installed)');
      return [];
    }
  }

  /**
   * Escape table name for SQL
   * @param {string} tableName - Table name
   * @returns {string} - Escaped table name
   */
  static escapeTableName(tableName) {
    return `"${tableName.replace(/"/g, '""')}"`;
  }

  /**
   * Run VACUUM and ANALYZE
   * @returns {Promise<Object>} - Maintenance result
   */
  static async runMaintenance() {
    try {
      logger.info('Running database maintenance...');

      await db.query('VACUUM ANALYZE');

      logger.info('✅ Database maintenance completed');

      return {
        success: true,
        message: 'Vacuum and analyze completed',
      };
    } catch (error) {
      logger.error('Database maintenance failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = DatabaseStatisticsService;
