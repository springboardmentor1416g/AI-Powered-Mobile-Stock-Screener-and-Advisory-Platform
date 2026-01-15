/**
 * analyst_data_service.js
 * Service for ingesting and processing analyst estimates, price targets, and earnings calendar data
 * 
 * Supports multiple data sources:
 * - Yahoo Finance API (free, no key required)
 * - Alpha Vantage (limited free tier)
 * - Polygon.io (requires key, free tier available)
 * - Manual CSV ingestion for buybacks
 */

const axios = require('axios');
const { Pool } = require('pg');

// Configuration
const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v10/finance';
const POLYGON_BASE = 'https://api.polygon.io/v1';
const POLYGON_KEY = process.env.POLYGON_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({ connectionString: DATABASE_URL });

// ============================================================================
// ANALYST PRICE TARGETS - YAHOO FINANCE
// ============================================================================

/**
 * Fetch analyst price targets for a stock from Yahoo Finance
 * Returns consensus target with distribution
 */
async function fetchAnalystPriceTargets(ticker) {
  try {
    const response = await axios.get(`${YAHOO_FINANCE_BASE}/quoteSummary/${ticker.toUpperCase()}`, {
      params: {
        modules: 'recommendationTrend,financialData'
      },
      timeout: 10000
    });

    const { quoteSummary } = response.data;
    if (!quoteSummary || !quoteSummary.result || quoteSummary.result.length === 0) {
      return null;
    }

    const result = quoteSummary.result[0];
    const recommendationTrend = result.recommendationTrend || {};
    const financialData = result.financialData || {};

    // Extract from recommendation trend (most recent entry)
    const recommendations = recommendationTrend.recommendation || [];
    const latest = recommendations[0] || {};

    // Normalize rating distribution
    const ratingDist = {
      strong_buy: latest.strongBuy || 0,
      buy: latest.buy || 0,
      hold: latest.hold || 0,
      sell: latest.sell || 0,
      strong_sell: latest.strongSell || 0
    };
    const totalAnalysts = Object.values(ratingDist).reduce((a, b) => a + b, 0);

    // Extract price target from financialData
    const priceTarget = financialData.targetPrice || {};
    const targetAvg = priceTarget.raw || null;
    const currentPrice = financialData.currentPrice?.raw || null;

    // Estimate low/high based on target if available
    let targetLow = null;
    let targetHigh = null;
    if (targetAvg) {
      // Conservative estimation: ±15% from average
      targetLow = parseFloat((targetAvg * 0.85).toFixed(2));
      targetHigh = parseFloat((targetAvg * 1.15).toFixed(2));
    }

    // Determine consensus rating (highest count)
    let consensusRating = 'Hold';
    let maxCount = 0;
    Object.entries(ratingDist).forEach(([rating, count]) => {
      if (count > maxCount) {
        maxCount = count;
        consensusRating = rating.replace('_', ' ').toUpperCase();
      }
    });

    return {
      ticker: ticker.toUpperCase(),
      provider: 'Yahoo Finance',
      data_date: new Date().toISOString().split('T')[0],
      price_target_low: targetLow,
      price_target_avg: targetAvg,
      price_target_high: targetHigh,
      num_analysts: totalAnalysts || null,
      rating: consensusRating,
      rating_distribution: ratingDist,
      current_price: currentPrice
    };
  } catch (error) {
    console.error(`Error fetching analyst targets for ${ticker}:`, error.message);
    return null;
  }
}

// ============================================================================
// EARNINGS ESTIMATES - POLYGON.IO (if key available)
// ============================================================================

/**
 * Fetch earnings estimates from Polygon.io
 * Requires POLYGON_API_KEY environment variable
 */
async function fetchEarningsEstimates(ticker) {
  if (!POLYGON_KEY) {
    console.warn('POLYGON_API_KEY not set, skipping earnings estimates fetch');
    return null;
  }

  try {
    const response = await axios.get(`${POLYGON_BASE}/reference/financials`, {
      params: {
        ticker: ticker.toUpperCase(),
        apiKey: POLYGON_KEY,
        limit: 5
      },
      timeout: 10000
    });

    const { results } = response.data;
    if (!results || results.length === 0) {
      return null;
    }

    // Parse most recent estimate
    const latest = results[0];
    const fiscalPeriod = latest.filing_date || new Date().toISOString().split('T')[0];

    return {
      ticker: ticker.toUpperCase(),
      provider: 'Polygon.io',
      estimate_period: `${new Date().getFullYear()}-FY`,
      estimate_date: new Date().toISOString().split('T')[0],
      fiscal_year: new Date().getFullYear(),
      eps_estimate: latest.eps || null,
      revenue_estimate: latest.revenue || null,
      num_analysts_eps: null,
      num_analysts_revenue: null,
      guidance_change: 'maintained'
    };
  } catch (error) {
    console.error(`Error fetching earnings estimates for ${ticker}:`, error.message);
    return null;
  }
}

// ============================================================================
// EARNINGS CALENDAR - YAHOO FINANCE
// ============================================================================

/**
 * Fetch earnings calendar dates from Yahoo Finance
 */
async function fetchEarningsCalendar(ticker) {
  try {
    const response = await axios.get(`${YAHOO_FINANCE_BASE}/quoteSummary/${ticker.toUpperCase()}`, {
      params: {
        modules: 'earningsHistory,earningsChart,earnings'
      },
      timeout: 10000
    });

    const { quoteSummary } = response.data;
    if (!quoteSummary || !quoteSummary.result || quoteSummary.result.length === 0) {
      return [];
    }

    const result = quoteSummary.result[0];
    const earningsChart = result.earningsChart || {};
    const earnings = result.earnings || {};

    const calendarEvents = [];

    // Process historical earnings
    const earningsHistory = result.earningsHistory?.earningsHistory || [];
    earningsHistory.slice(0, 8).forEach((earning) => {
      const epsDate = new Date(earning.epsReportDate * 1000).toISOString().split('T')[0];
      
      calendarEvents.push({
        ticker: ticker.toUpperCase(),
        event_date: epsDate,
        event_type: 'earnings_announcement',
        status: 'reported',
        eps_actual: earning.epsActual?.raw || null,
        eps_estimate: earning.epsEstimate?.raw || null,
        eps_surprise: earning.epsSurprise?.raw || null,
        fiscal_period: null,
        fiscal_year: null,
        source: 'Yahoo Finance'
      });
    });

    // Process upcoming earnings (if available in earningsChart)
    const earningsDateStart = earnings.earningsDate?.[0];
    if (earningsDateStart) {
      const upcomingDate = new Date(earningsDateStart * 1000).toISOString().split('T')[0];
      
      calendarEvents.push({
        ticker: ticker.toUpperCase(),
        event_date: upcomingDate,
        event_type: 'earnings_announcement',
        status: 'scheduled',
        eps_actual: null,
        eps_estimate: earnings.epsTrailingTwelveMonths?.raw || null,
        eps_surprise: null,
        fiscal_period: null,
        fiscal_year: null,
        source: 'Yahoo Finance'
      });
    }

    return calendarEvents;
  } catch (error) {
    console.error(`Error fetching earnings calendar for ${ticker}:`, error.message);
    return [];
  }
}

// ============================================================================
// BUYBACK ANNOUNCEMENTS - MANUAL/CSV INGESTION HELPER
// ============================================================================

/**
 * Parse buyback announcement from structured data
 * Validates and normalizes buyback record
 */
function validateBuybackRecord(record) {
  const errors = [];

  // Required fields
  if (!record.ticker || typeof record.ticker !== 'string') {
    errors.push('ticker: required string');
  }
  if (!record.announcement_date || !isValidDate(record.announcement_date)) {
    errors.push('announcement_date: required ISO date');
  }
  if (!record.buyback_type || !['open_market', 'tender_offer', 'accelerated_share_repurchase'].includes(record.buyback_type.toLowerCase())) {
    errors.push('buyback_type: must be open_market, tender_offer, or accelerated_share_repurchase');
  }
  
  // Amount validation - accept both number and string that can be parsed
  const amount = typeof record.amount === 'string' ? parseFloat(record.amount) : record.amount;
  if (!amount || isNaN(amount) || amount <= 0) {
    errors.push('amount: required positive number');
  }

  // Optional but validated fields
  if (record.price_range_low && record.price_range_high) {
    if (record.price_range_low > record.price_range_high) {
      errors.push('price_range_low must be <= price_range_high');
    }
  }
  if (record.period_start && record.period_end) {
    if (new Date(record.period_start) > new Date(record.period_end)) {
      errors.push('period_start must be <= period_end');
    }
  }

  return { valid: errors.length === 0, errors };
}

function isValidDate(dateString) {
  return !isNaN(Date.parse(dateString));
}

/**
 * Normalize buyback announcement for storage
 */
function normalizeBuybackRecord(record) {
  return {
    ticker: record.ticker.toUpperCase().trim(),
    announcement_date: new Date(record.announcement_date).toISOString().split('T')[0],
    effective_date: record.effective_date ? new Date(record.effective_date).toISOString().split('T')[0] : null,
    authorization_date: record.authorization_date ? new Date(record.authorization_date).toISOString().split('T')[0] : null,
    buyback_type: record.buyback_type.toLowerCase(),
    amount: parseFloat(record.amount),
    expiration_date: record.expiration_date ? new Date(record.expiration_date).toISOString().split('T')[0] : null,
    status: (record.status || 'active').toLowerCase(),
    source: (record.source || 'MANUAL').toUpperCase(),
    notes: record.notes || null
  };
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Upsert analyst price target
 */
async function upsertAnalystPriceTarget(data) {
  if (!data || !data.ticker) return;

  const query = `
    INSERT INTO analyst_price_targets 
    (ticker, provider, data_date, price_target_low, price_target_avg, price_target_high, 
     num_analysts, rating, rating_distribution, last_updated)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (ticker, provider, data_date) 
    DO UPDATE SET
      price_target_low = EXCLUDED.price_target_low,
      price_target_avg = EXCLUDED.price_target_avg,
      price_target_high = EXCLUDED.price_target_high,
      num_analysts = EXCLUDED.num_analysts,
      rating = EXCLUDED.rating,
      rating_distribution = EXCLUDED.rating_distribution,
      last_updated = NOW();
  `;

  try {
    await pool.query(query, [
      data.ticker,
      data.provider,
      data.data_date,
      data.price_target_low,
      data.price_target_avg,
      data.price_target_high,
      data.num_analysts,
      data.rating,
      JSON.stringify(data.rating_distribution || {})
    ]);
  } catch (error) {
    console.error(`Error upserting analyst price target for ${data.ticker}:`, error.message);
    throw error;
  }
}

/**
 * Upsert earnings estimate
 */
async function upsertEarningsEstimate(data) {
  if (!data || !data.ticker) return;

  const query = `
    INSERT INTO analyst_earnings_estimates
    (ticker, provider, estimate_period, estimate_date, fiscal_year, fiscal_quarter,
     eps_estimate, eps_low, eps_high, revenue_estimate, revenue_low, revenue_high,
     num_analysts_eps, num_analysts_revenue, guidance_change)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    ON CONFLICT (ticker, provider, estimate_period, estimate_date)
    DO UPDATE SET
      eps_estimate = EXCLUDED.eps_estimate,
      revenue_estimate = EXCLUDED.revenue_estimate,
      guidance_change = EXCLUDED.guidance_change,
      last_updated = NOW();
  `;

  try {
    await pool.query(query, [
      data.ticker,
      data.provider,
      data.estimate_period,
      data.estimate_date,
      data.fiscal_year || null,
      data.fiscal_quarter || null,
      data.eps_estimate || null,
      data.eps_low || null,
      data.eps_high || null,
      data.revenue_estimate || null,
      data.revenue_low || null,
      data.revenue_high || null,
      data.num_analysts_eps || null,
      data.num_analysts_revenue || null,
      data.guidance_change || 'maintained'
    ]);
  } catch (error) {
    console.error(`Error upserting earnings estimate for ${data.ticker}:`, error.message);
    throw error;
  }
}

/**
 * Upsert earnings calendar event
 */
async function upsertEarningsEvent(data) {
  if (!data || !data.ticker) return;

  const query = `
    INSERT INTO earnings_calendar_schedule
    (ticker, event_date, fiscal_period, fiscal_year, event_type, status,
     eps_actual, eps_estimate, eps_surprise, source)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (ticker, event_date, event_type)
    DO UPDATE SET
      status = EXCLUDED.status,
      eps_actual = COALESCE(EXCLUDED.eps_actual, earnings_calendar_schedule.eps_actual),
      eps_estimate = COALESCE(EXCLUDED.eps_estimate, earnings_calendar_schedule.eps_estimate),
      eps_surprise = COALESCE(EXCLUDED.eps_surprise, earnings_calendar_schedule.eps_surprise),
      updated_at = NOW();
  `;

  try {
    await pool.query(query, [
      data.ticker,
      data.event_date,
      data.fiscal_period || null,
      data.fiscal_year || null,
      data.event_type,
      data.status,
      data.eps_actual || null,
      data.eps_estimate || null,
      data.eps_surprise || null,
      data.source
    ]);
  } catch (error) {
    console.error(`Error upserting earnings event for ${data.ticker}:`, error.message);
    throw error;
  }
}

/**
 * Upsert buyback announcement
 */
async function upsertBuybackAnnouncement(data) {
  if (!data || !data.ticker) return;

  const query = `
    INSERT INTO buyback_announcements
    (ticker, announcement_date, effective_date, authorization_date, buyback_type,
     amount, expiration_date, status, source, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT DO NOTHING;
  `;

  try {
    await pool.query(query, [
      data.ticker,
      data.announcement_date,
      data.effective_date || null,
      data.authorization_date || null,
      data.buyback_type,
      data.amount,
      data.expiration_date || null,
      data.status,
      data.source,
      data.notes || null
    ]);
  } catch (error) {
    console.error(`Error upserting buyback for ${data.ticker}:`, error.message);
    throw error;
  }
}

/**
 * Log ingestion metadata
 */
async function logIngestionMetadata(dataType, source, success, recordCount, errorMessage = null) {
  const query = `
    INSERT INTO ingestion_metadata 
    (data_type, source, last_fetched, success, record_count, error_message, data_age_days)
    VALUES ($1, $2, NOW(), $3, $4, $5, 0)
    ON CONFLICT (data_type, source)
    DO UPDATE SET
      last_fetched = NOW(),
      success = $3,
      record_count = $4,
      error_message = $5,
      data_age_days = 0;
  `;

  try {
    await pool.query(query, [dataType, source, success, recordCount || 0, errorMessage || null]);
  } catch (error) {
    console.error(`Error logging ingestion metadata:`, error.message);
  }
}

module.exports = {
  // Fetch functions
  fetchAnalystPriceTargets,
  fetchEarningsEstimates,
  fetchEarningsCalendar,

  // Validation/normalization
  validateBuybackRecord,
  normalizeBuybackRecord,

  // Database operations
  upsertAnalystPriceTarget,
  upsertEarningsEstimate,
  upsertEarningsEvent,
  upsertBuybackAnnouncement,
  logIngestionMetadata,

  // Pool for cleanup
  pool
};
