/**
 * Watchlist Setup Screen
 * Database setup for user watchlists
 */

const db = require('../../../config/database');
const logger = require('../../../config/logger');

class WatchlistSetup {
  /**
   * Setup watchlist tables
   * @returns {Promise<Object>} - Setup result
   */
  static async setup() {
    try {
      logger.info('Setting up watchlist tables...');

      // Create watchlists table
      await db.query(`
        CREATE TABLE IF NOT EXISTS watchlists (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
        CREATE INDEX IF NOT EXISTS idx_watchlists_is_active ON watchlists(is_active);
      `);

      // Create watchlist items table
      await db.query(`
        CREATE TABLE IF NOT EXISTS watchlist_items (
          id SERIAL PRIMARY KEY,
          watchlist_id INTEGER NOT NULL,
          ticker VARCHAR(20) NOT NULL,
          added_at TIMESTAMP DEFAULT NOW(),
          notes TEXT,
          UNIQUE(watchlist_id, ticker),
          FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE,
          FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE RESTRICT
        );

        CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id);
        CREATE INDEX IF NOT EXISTS idx_watchlist_items_ticker ON watchlist_items(ticker);
      `);

      logger.info('✅ Watchlist tables created successfully');

      return {
        success: true,
        message: 'Watchlist tables setup complete',
      };
    } catch (error) {
      logger.error('Error setting up watchlist tables:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify watchlist tables
   * @returns {Promise<Object>} - Verification result
   */
  static async verify() {
    try {
      const result = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('watchlists', 'watchlist_items')
      `);

      return {
        tablesExist: result.rows.length === 2,
        tables: result.rows.map(r => r.table_name),
      };
    } catch (error) {
      logger.error('Error verifying watchlist tables:', error);
      return {
        tablesExist: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user watchlist summary
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - Watchlist summary
   */
  static async getUserWatchlistSummary(userId) {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(DISTINCT w.id) as watchlist_count,
          COUNT(wi.id) as item_count
        FROM watchlists w
        LEFT JOIN watchlist_items wi ON w.id = wi.watchlist_id
        WHERE w.user_id = $1
      `, [userId]);

      return result.rows[0];
    } catch (error) {
      logger.error('Error getting watchlist summary:', error);
      return null;
    }
  }
}

module.exports = WatchlistSetup;
