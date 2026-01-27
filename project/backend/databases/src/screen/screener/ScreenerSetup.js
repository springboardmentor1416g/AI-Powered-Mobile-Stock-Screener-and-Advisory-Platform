/**
 * Screener Setup Screen
 * Database setup for saved screeners and query history
 */

const db = require('../../../config/database');
const logger = require('../../../config/logger');

class ScreenerSetup {
  /**
   * Setup screener tables
   * @returns {Promise<Object>} - Setup result
   */
  static async setup() {
    try {
      logger.info('Setting up screener tables...');

      // Create saved_screens table
      await db.query(`
        CREATE TABLE IF NOT EXISTS saved_screens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          filter_dsl JSONB NOT NULL,
          is_public BOOLEAN DEFAULT FALSE,
          view_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_screens_user_id ON saved_screens(user_id);
        CREATE INDEX IF NOT EXISTS idx_screens_is_public ON saved_screens(is_public);
        CREATE INDEX IF NOT EXISTS idx_screens_created_at ON saved_screens(created_at DESC);
      `);

      // Create screener history table
      await db.query(`
        CREATE TABLE IF NOT EXISTS screener_history (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          filter_dsl JSONB NOT NULL,
          result_count INTEGER,
          execution_time_ms INTEGER,
          created_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_history_user_id ON screener_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_history_created_at ON screener_history(created_at DESC);
      `);

      logger.info('✅ Screener tables created successfully');

      return {
        success: true,
        message: 'Screener tables setup complete',
      };
    } catch (error) {
      logger.error('Error setting up screener tables:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify screener tables
   * @returns {Promise<Object>} - Verification result
   */
  static async verify() {
    try {
      const result = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('saved_screens', 'screener_history')
      `);

      return {
        tablesExist: result.rows.length === 2,
        tables: result.rows.map(r => r.table_name),
      };
    } catch (error) {
      logger.error('Error verifying screener tables:', error);
      return {
        tablesExist: false,
        error: error.message,
      };
    }
  }

  /**
   * Get saved screen stats
   * @returns {Promise<Object>} - Statistics
   */
  static async getStats() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_screens,
          SUM(CASE WHEN is_public THEN 1 ELSE 0 END) as public_screens,
          MAX(created_at) as latest_screen
        FROM saved_screens
      `);

      return result.rows[0];
    } catch (error) {
      logger.error('Error getting screener stats:', error);
      return null;
    }
  }
}

module.exports = ScreenerSetup;
