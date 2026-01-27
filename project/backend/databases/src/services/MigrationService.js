/**
 * Migration Service
 * Manages database schema migrations and setup
 */

const db = require('../../config/database');
const logger = require('../../config/logger');
const AuthSetup = require('../screens/auth/AuthSetup');
const PortfolioSetup = require('../screens/portfolio/PortfolioSetup');
const ScreenerSetup = require('../screens/screener/ScreenerSetup');
const WatchlistSetup = require('../screens/watchlist/WatchlistSetup');

class MigrationService {
  /**
   * Run all migrations
   * @returns {Promise<Object>} - Migration result
   */
  static async runAllMigrations() {
    try {
      logger.info('Starting database migrations...');

      const results = {};

      // Run auth setup
      logger.info('Running auth migration...');
      results.auth = await AuthSetup.setup();

      // Run portfolio setup
      logger.info('Running portfolio migration...');
      results.portfolio = await PortfolioSetup.setup();

      // Run screener setup
      logger.info('Running screener migration...');
      results.screener = await ScreenerSetup.setup();

      // Run watchlist setup
      logger.info('Running watchlist migration...');
      results.watchlist = await WatchlistSetup.setup();

      logger.info('✅ All migrations completed successfully');

      return {
        success: true,
        migrations: results,
      };
    } catch (error) {
      logger.error('Migration failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify all tables exist
   * @returns {Promise<Object>} - Verification result
   */
  static async verifyAllTables() {
    try {
      const results = {
        auth: await AuthSetup.verify(),
        portfolio: await PortfolioSetup.verify(),
        screener: await ScreenerSetup.verify(),
        watchlist: await WatchlistSetup.verify(),
      };

      const allValid = Object.values(results).every(r => r.exists || r.tablesExist);

      return {
        success: allValid,
        verification: results,
      };
    } catch (error) {
      logger.error('Verification failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get database status
   * @returns {Promise<Object>} - Database status
   */
  static async getDatabaseStatus() {
    try {
      const verification = await this.verifyAllTables();
      
      const tableCountResult = await db.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      return {
        status: verification.success ? 'ready' : 'incomplete',
        totalTables: parseInt(tableCountResult.rows[0].count),
        verification: verification.verification,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to get database status:', error);
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Rollback all tables (WARNING: Destructive)
   * @returns {Promise<Object>} - Rollback result
   */
  static async rollbackAllTables() {
    try {
      logger.warn('Rolling back all tables...');

      await db.query(`
        DROP TABLE IF EXISTS watchlist_items CASCADE;
        DROP TABLE IF EXISTS watchlists CASCADE;
        DROP TABLE IF EXISTS screener_history CASCADE;
        DROP TABLE IF EXISTS saved_screens CASCADE;
        DROP TABLE IF EXISTS portfolio_positions CASCADE;
        DROP TABLE IF EXISTS user_portfolios CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);

      logger.info('✅ All tables rolled back');

      return {
        success: true,
        message: 'All tables dropped successfully',
      };
    } catch (error) {
      logger.error('Rollback failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = MigrationService;
