/**
 * Portfolio Setup Screen
 * Database setup for portfolio and position tracking
 */

const db = require('../../../config/database');
const logger = require('../../../config/logger');

class PortfolioSetup {
  /**
   * Setup portfolio tables
   * @returns {Promise<Object>} - Setup result
   */
  static async setup() {
    try {
      logger.info('Setting up portfolio tables...');

      // Create portfolios table
      await db.query(`
        CREATE TABLE IF NOT EXISTS user_portfolios (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON user_portfolios(user_id);
        CREATE INDEX IF NOT EXISTS idx_portfolios_is_active ON user_portfolios(is_active);
      `);

      // Create portfolio positions table
      await db.query(`
        CREATE TABLE IF NOT EXISTS portfolio_positions (
          id SERIAL PRIMARY KEY,
          portfolio_id INTEGER NOT NULL,
          ticker VARCHAR(20) NOT NULL,
          quantity NUMERIC(18,6) NOT NULL,
          entry_price NUMERIC(18,4) NOT NULL,
          entry_date DATE NOT NULL,
          exit_price NUMERIC(18,4),
          exit_date DATE,
          status VARCHAR(50) DEFAULT 'open',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (portfolio_id) REFERENCES user_portfolios(id) ON DELETE CASCADE,
          FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE RESTRICT
        );

        CREATE INDEX IF NOT EXISTS idx_positions_portfolio_id ON portfolio_positions(portfolio_id);
        CREATE INDEX IF NOT EXISTS idx_positions_ticker ON portfolio_positions(ticker);
        CREATE INDEX IF NOT EXISTS idx_positions_status ON portfolio_positions(status);
      `);

      logger.info('✅ Portfolio tables created successfully');

      return {
        success: true,
        message: 'Portfolio tables setup complete',
      };
    } catch (error) {
      logger.error('Error setting up portfolio tables:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify portfolio tables
   * @returns {Promise<Object>} - Verification result
   */
  static async verify() {
    try {
      const result = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('user_portfolios', 'portfolio_positions')
      `);

      return {
        tablesExist: result.rows.length === 2,
        tables: result.rows.map(r => r.table_name),
      };
    } catch (error) {
      logger.error('Error verifying portfolio tables:', error);
      return {
        tablesExist: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user portfolio summary
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - Portfolio summary
   */
  static async getUserPortfolioSummary(userId) {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(DISTINCT p.id) as portfolio_count,
          COUNT(pp.id) as position_count,
          SUM(CASE WHEN pp.status = 'open' THEN 1 ELSE 0 END) as open_positions
        FROM user_portfolios p
        LEFT JOIN portfolio_positions pp ON p.id = pp.portfolio_id
        WHERE p.user_id = $1
      `, [userId]);

      return result.rows[0];
    } catch (error) {
      logger.error('Error getting portfolio summary:', error);
      return null;
    }
  }
}

module.exports = PortfolioSetup;
