/**
 * Alert Evaluation Engine
 * Evaluates alert conditions against current stock data
 */

const { Pool } = require('pg');
const notificationService = require('./notification.service');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Evaluate a single condition against data
 */
function evaluateCondition(condition, data) {
  if (!condition || typeof condition !== 'object') {
    return false;
  }

  // Handle logical operators
  if (condition.and) {
    return condition.and.every(cond => evaluateCondition(cond, data));
  }

  if (condition.or) {
    return condition.or.some(cond => evaluateCondition(cond, data));
  }

  if (condition.not) {
    return !evaluateCondition(condition.not, data);
  }

  // Handle basic comparisons
  if (condition.field && condition.operator && condition.value !== undefined) {
    const fieldValue = getNestedValue(data, condition.field);
    
    if (fieldValue === null || fieldValue === undefined) {
      return false;
    }

    return compareValues(fieldValue, condition.operator, condition.value);
  }

  return false;
}

/**
 * Get nested object value by path (e.g., 'fundamentals.pe_ratio')
 */
function getNestedValue(obj, path) {
  if (!obj || typeof obj !== 'object') return null;
  
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return null;
    }
  }
  
  return value;
}

/**
 * Compare values based on operator
 */
function compareValues(value, operator, threshold) {
  const numValue = parseFloat(value);
  const numThreshold = parseFloat(threshold);

  if (isNaN(numValue) || isNaN(numThreshold)) {
    return false;
  }

  switch (operator) {
    case '<':
      return numValue < numThreshold;
    case '<=':
      return numValue <= numThreshold;
    case '>':
      return numValue > numThreshold;
    case '>=':
      return numValue >= numThreshold;
    case '==':
    case '=':
      return numValue === numThreshold;
    case '!=':
      return numValue !== numThreshold;
    default:
      return false;
  }
}

/**
 * Fetch current data for a ticker
 */
async function getTickerData(ticker) {
  try {
    // Get latest price
    const priceResult = await pool.query(
      `SELECT close, high, low, open, volume 
       FROM price_history 
       WHERE ticker = $1 
       ORDER BY time DESC 
       LIMIT 1`,
      [ticker]
    );

    // Get latest fundamentals
    const fundamentalsResult = await pool.query(
      `SELECT 
        revenue, net_income, eps, pe_ratio, pb_ratio, ebitda,
        operating_margin, roe, roa
       FROM fundamentals_quarterly 
       WHERE ticker = $1 
       ORDER BY period_end DESC 
       LIMIT 1`,
      [ticker]
    );

    // Get analyst estimates
    const analystResult = await pool.query(
      `SELECT price_target_high, price_target_low, price_target_avg, rating
       FROM analyst_estimates 
       WHERE ticker = $1 
       ORDER BY estimate_date DESC 
       LIMIT 1`,
      [ticker]
    );

    // Get earnings calendar
    const earningsResult = await pool.query(
      `SELECT next_earnings_date, last_earnings_date, last_eps, eps_surprise
       FROM earnings_calendar 
       WHERE ticker = $1`,
      [ticker]
    );

    // Get recent buybacks
    const buybacksResult = await pool.query(
      `SELECT announcement_date, amount, shares
       FROM buybacks 
       WHERE ticker = $1 
       ORDER BY announcement_date DESC 
       LIMIT 5`,
      [ticker]
    );

    const price = priceResult.rows[0] || {};
    const fundamentals = fundamentalsResult.rows[0] || {};
    const analyst = analystResult.rows[0] || {};
    const earnings = earningsResult.rows[0] || {};
    const buybacks = buybacksResult.rows || [];

    return {
      ticker,
      price,
      fundamentals,
      analyst,
      earnings,
      buybacks,
      timestamp: new Date()
    };
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    throw error;
  }
}

/**
 * Check if alert should trigger based on special event conditions
 */
async function checkEventConditions(alert, tickerData) {
  const rule = alert.alert_rule;
  
  // Check for earnings within N days
  if (typeof rule === 'object' && rule.earnings_within_days) {
    const nextEarningsDate = tickerData.earnings?.next_earnings_date;
    if (nextEarningsDate) {
      const daysUntilEarnings = Math.floor(
        (new Date(nextEarningsDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilEarnings >= 0 && daysUntilEarnings <= rule.earnings_within_days) {
        return true;
      }
    }
  }

  // Check for recent buyback
  if (typeof rule === 'object' && rule.buyback_within_days) {
    const recentBuyback = tickerData.buybacks?.[0];
    if (recentBuyback) {
      const daysSinceBuyback = Math.floor(
        (new Date() - new Date(recentBuyback.announcement_date)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceBuyback >= 0 && daysSinceBuyback <= rule.buyback_within_days) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Evaluate alert for a specific user and ticker
 */
async function evaluateAlert(alert, tickerData) {
  try {
    const rule = alert.alert_rule;
    
    // Check event-based conditions
    const eventTriggered = await checkEventConditions(alert, tickerData);
    if (eventTriggered) {
      return { triggered: true, reason: 'event_condition' };
    }

    // Prepare evaluation data
    const evaluationData = {
      price: tickerData.price,
      fundamentals: tickerData.fundamentals,
      analyst: tickerData.analyst,
      earnings: tickerData.earnings
    };

    // Parse rule if it's JSON string
    const parsedRule = typeof rule === 'string' ? JSON.parse(rule) : rule;

    // Evaluate condition
    const triggered = evaluateCondition(parsedRule, evaluationData);

    return {
      triggered,
      reason: triggered ? 'condition_met' : 'condition_not_met',
      evaluationData
    };
  } catch (error) {
    console.error(`Error evaluating alert ${alert.id}:`, error);
    return {
      triggered: false,
      reason: 'evaluation_error',
      error: error.message
    };
  }
}

/**
 * Execute alert evaluation and trigger notifications
 */
async function executeAlertEvaluation(alertId) {
  const client = await pool.connect();
  try {
    // Fetch alert
    const alertResult = await client.query(
      `SELECT id, user_id, ticker, alert_rule, alert_type, status 
       FROM watchlist_alerts 
       WHERE id = $1 AND status = 'active'`,
      [alertId]
    );

    if (alertResult.rows.length === 0) {
      console.log(`Alert ${alertId} not found or inactive`);
      return null;
    }

    const alert = alertResult.rows[0];

    // Get ticker data
    const tickerData = await getTickerData(alert.ticker);

    // Evaluate alert
    const evaluation = await evaluateAlert(alert, tickerData);

    if (evaluation.triggered) {
      // Log trigger
      const trigger = await notificationService.logAlertTrigger(
        alert.id,
        alert.user_id,
        alert.ticker,
        evaluation.evaluationData
      );

      // Create notification
      const title = `${alert.ticker} Alert Triggered`;
      const message = `Your alert "${alert.alert_rule}" has been triggered for ${alert.ticker}`;
      
      const notification = await notificationService.createNotification(
        alert.user_id,
        trigger.id,
        title,
        message,
        alert.alert_type,
        alert.ticker
      );

      console.log(`Alert ${alertId} triggered. Notification ${notification.id} created.`);
      
      return {
        alertId,
        triggered: true,
        notification
      };
    }

    return {
      alertId,
      triggered: false
    };
  } catch (error) {
    console.error(`Error executing alert evaluation for ${alertId}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run periodic evaluation of all active alerts
 */
async function evaluateAllAlerts(options = {}) {
  const { alertType, evaluationFrequency } = options;
  
  try {
    let query = `
      SELECT id, user_id, ticker, alert_rule, alert_type, evaluation_frequency
      FROM watchlist_alerts 
      WHERE status = 'active'
    `;
    
    const params = [];
    let paramIndex = 1;

    if (alertType) {
      query += ` AND alert_type = $${paramIndex++}`;
      params.push(alertType);
    }

    if (evaluationFrequency) {
      query += ` AND evaluation_frequency = $${paramIndex++}`;
      params.push(evaluationFrequency);
    }

    const result = await pool.query(query, params);
    const alerts = result.rows;

    console.log(`Evaluating ${alerts.length} active alerts`);

    const results = [];
    for (const alert of alerts) {
      try {
        const result = await executeAlertEvaluation(alert.id);
        results.push(result);
      } catch (error) {
        console.error(`Error evaluating alert ${alert.id}:`, error);
        results.push({
          alertId: alert.id,
          error: error.message
        });
      }
    }

    const triggered = results.filter(r => r.triggered).length;
    console.log(`Alert evaluation complete: ${triggered}/${alerts.length} alerts triggered`);

    return {
      total: alerts.length,
      triggered,
      results
    };
  } catch (error) {
    console.error('Error during alert evaluation:', error);
    throw error;
  }
}

module.exports = {
  evaluateAlert,
  executeAlertEvaluation,
  evaluateAllAlerts,
  getTickerData,
  evaluateCondition,
  compareValues
};
