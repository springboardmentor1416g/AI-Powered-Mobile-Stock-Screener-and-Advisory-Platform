/**
 * Auth Setup Screen
 * Database setup for authentication tables and functions
 */

const db = require('../../../config/database');
const logger = require('../../../config/logger');

class AuthSetup {
  /**
   * Setup authentication tables
   * @returns {Promise<Object>} - Setup result
   */
  static async setup() {
    try {
      logger.info('Setting up authentication tables...');

      // Create users table if not exists
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          is_active BOOLEAN DEFAULT TRUE,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
      `);

      logger.info('✅ Authentication tables created successfully');

      return {
        success: true,
        message: 'Authentication tables setup complete',
      };
    } catch (error) {
      logger.error('Error setting up auth tables:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify auth tables exist
   * @returns {Promise<Object>} - Verification result
   */
  static async verify() {
    try {
      const result = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      `);

      return {
        exists: result.rows.length > 0,
        table: 'users',
      };
    } catch (error) {
      logger.error('Error verifying auth tables:', error);
      return {
        exists: false,
        error: error.message,
      };
    }
  }

  /**
   * Count users in database
   * @returns {Promise<number>} - User count
   */
  static async getUserCount() {
    try {
      const result = await db.query('SELECT COUNT(*) as count FROM users');
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('Error counting users:', error);
      return 0;
    }
  }
}

module.exports = AuthSetup;
