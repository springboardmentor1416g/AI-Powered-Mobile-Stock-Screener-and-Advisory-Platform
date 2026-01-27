/**
 * Market Data Routes
 * Handles stock quotes, time series, and company data
 */

const express = require('express');
const { query, validationResult } = require('express-validator');
const twelveDataService = require('../services/market_data/twelve_data_service');
const dataIngestion = require('../services/market_data/data_ingestion');
const db = require('../config/database');

const router = express.Router();

/**
 * GET /api/v1/market/quote/:symbol
 * Get real-time quote for a symbol
 */
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await twelveDataService.getQuote(symbol);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/market/timeseries/:symbol
 * Get time series data (OHLCV)
 */
router.get(
  '/timeseries/:symbol',
  [
    query('interval').optional().isIn(['1min', '5min', '15min', '30min', '1h', '1day', '1week', '1month']),
    query('outputsize').optional().isInt({ min: 1, max: 5000 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { symbol } = req.params;
      const interval = req.query.interval || '1day';
      const outputsize = parseInt(req.query.outputsize) || 365;

      const result = await twelveDataService.getTimeSeries(symbol, interval, outputsize);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/market/profile/:symbol
 * Get company profile
 */
router.get('/profile/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await twelveDataService.getProfile(symbol);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/market/statistics/:symbol
 * Get key statistics
 */
router.get('/statistics/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await twelveDataService.getStatistics(symbol);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/market/fundamentals/:symbol
 * Get fundamental data
 */
router.get(
  '/fundamentals/:symbol',
  [query('period').optional().isIn(['annual', 'quarterly'])],
  async (req, res) => {
    try {
      const { symbol } = req.params;
      const period = req.query.period || 'quarterly';

      const [income, balance, cashflow] = await Promise.all([
        twelveDataService.getIncomeStatement(symbol, period),
        twelveDataService.getBalanceSheet(symbol, period),
        twelveDataService.getCashFlow(symbol, period),
      ]);

      res.json({
        success: true,
        data: {
          income_statement: income.data || [],
          balance_sheet: balance.data || [],
          cash_flow: cashflow.data || [],
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/market/earnings/:symbol
 * Get earnings calendar
 */
router.get('/earnings/:symbol?', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await twelveDataService.getEarnings(symbol || null);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/market/dividends/:symbol
 * Get dividend history
 */
router.get('/dividends/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await twelveDataService.getDividends(symbol);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/market/splits/:symbol
 * Get stock split history
 */
router.get('/splits/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await twelveDataService.getSplits(symbol);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/market/search
 * Search for stocks
 */
router.get(
  '/search',
  [query('q').notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { q } = req.query;
      const result = await twelveDataService.searchStocks(q);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/market/companies
 * Get all companies from database
 */
router.get('/companies', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const sector = req.query.sector;
    const exchange = req.query.exchange;

    let query = 'SELECT * FROM companies WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (sector) {
      query += ` AND sector = $${paramIndex}`;
      params.push(sector);
      paramIndex++;
    }

    if (exchange) {
      query += ` AND exchange = $${paramIndex}`;
      params.push(exchange);
      paramIndex++;
    }

    query += ` ORDER BY ticker LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    const countResult = await db.query('SELECT COUNT(*) as total FROM companies');

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/market/sectors
 * Get list of sectors
 */
router.get('/sectors', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT sector, COUNT(*) as count
      FROM companies
      WHERE sector IS NOT NULL
      GROUP BY sector
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/market/exchanges
 * Get list of exchanges
 */
router.get('/exchanges', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT exchange, COUNT(*) as count
      FROM companies
      WHERE exchange IS NOT NULL
      GROUP BY exchange
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;