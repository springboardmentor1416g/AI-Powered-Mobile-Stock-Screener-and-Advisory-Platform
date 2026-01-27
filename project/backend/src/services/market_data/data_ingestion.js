const db = require('../../config/database');
const twelveDataService = require('./twelve_data_service');
const logger = require('../../config/logger');
const fs = require('fs').promises;
const path = require('path');

class DataIngestionService {
  constructor() {
    this.rawDataPath = path.join(__dirname, '../../../storage/raw');
  }

  /**
   * Ingest company profile
   */
  async ingestCompanyProfile(symbol) {
    try {
      const profile = await twelveDataService.getProfile(symbol);
      
      if (!profile.success) {
        throw new Error(profile.error);
      }

      const data = profile.data;

      const query = `
        INSERT INTO companies (ticker, name, sector, industry, exchange, currency, country, type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (ticker) 
        DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          industry = EXCLUDED.industry,
          exchange = EXCLUDED.exchange,
          currency = EXCLUDED.currency,
          country = EXCLUDED.country,
          updated_at = NOW()
        RETURNING *
      `;

      const values = [
        symbol,
        data.name,
        data.sector,
        data.industry,
        data.exchange,
        data.currency,
        data.country,
        'Common Stock',
      ];

      const result = await db.query(query, values);
      logger.info(`Successfully ingested profile for ${symbol}`);

      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error(`Error ingesting profile for ${symbol}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ingest price history
   */
  async ingestPriceHistory(symbol, interval = '1day', days = 365) {
    try {
      const timeSeries = await twelveDataService.getTimeSeries(symbol, interval, days);
      
      if (!timeSeries.success) {
        throw new Error(timeSeries.error);
      }

      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');

        for (const record of timeSeries.data) {
          const query = `
            INSERT INTO price_history (time, ticker, open, high, low, close, volume)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (time, ticker) DO NOTHING
          `;

          const values = [
            new Date(record.datetime),
            symbol,
            record.open,
            record.high,
            record.low,
            record.close,
            record.volume,
          ];

          await client.query(query, values);
        }

        await client.query('COMMIT');
        logger.info(`Successfully ingested ${timeSeries.data.length} price records for ${symbol}`);

        return { success: true, recordCount: timeSeries.data.length };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error(`Error ingesting price history for ${symbol}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ingest income statement
   */
  async ingestIncomeStatement(symbol, period = 'quarterly') {
    try {
      const incomeData = await twelveDataService.getIncomeStatement(symbol, period);
      
      if (!incomeData.success) {
        throw new Error(incomeData.error);
      }

      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');

        for (const statement of incomeData.data) {
          const query = `
            INSERT INTO income_statement 
            (ticker, period, fiscal_year, fiscal_date, revenue, cost_of_revenue, 
             gross_profit, operating_expenses, operating_income, net_income, 
             ebitda, eps_basic, eps_diluted, shares_outstanding)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (ticker, period, fiscal_year) 
            DO UPDATE SET
              revenue = EXCLUDED.revenue,
              net_income = EXCLUDED.net_income,
              ebitda = EXCLUDED.ebitda,
              updated_at = NOW()
          `;

          const fiscalDate = new Date(statement.fiscal_date);
          const fiscalYear = fiscalDate.getFullYear();
          const periodStr = period === 'quarterly' ? `Q${Math.ceil((fiscalDate.getMonth() + 1) / 3)}` : 'Annual';

          const values = [
            symbol,
            periodStr,
            fiscalYear,
            statement.fiscal_date,
            statement.revenue,
            statement.cost_of_revenue,
            statement.gross_profit,
            statement.operating_expenses,
            statement.operating_income,
            statement.net_income,
            statement.ebitda,
            statement.basic_eps,
            statement.diluted_eps,
            statement.shares_outstanding,
          ];

          await client.query(query, values);
        }

        await client.query('COMMIT');
        logger.info(`Successfully ingested income statement for ${symbol}`);

        return { success: true };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error(`Error ingesting income statement for ${symbol}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Batch ingest multiple symbols
   */
  async batchIngest(symbols, dataTypes = ['profile', 'price']) {
    const results = {
      successful: [],
      failed: [],
    };

    for (const symbol of symbols) {
      try {
        logger.info(`Processing ${symbol}...`);

        if (dataTypes.includes('profile')) {
          await this.ingestCompanyProfile(symbol);
        }

        if (dataTypes.includes('price')) {
          await this.ingestPriceHistory(symbol);
        }

        if (dataTypes.includes('income')) {
          await this.ingestIncomeStatement(symbol);
        }

        results.successful.push(symbol);
        
        // Rate limiting - Twelve Data free tier: 8 API calls/minute
        await this.sleep(8000);
      } catch (error) {
        logger.error(`Failed to ingest ${symbol}:`, error);
        results.failed.push({ symbol, error: error.message });
      }
    }

    return results;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new DataIngestionService();
