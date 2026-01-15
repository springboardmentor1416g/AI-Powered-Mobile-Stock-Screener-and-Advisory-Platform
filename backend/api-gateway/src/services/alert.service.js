const { Pool } = require('pg');
const path = require('path');
const validateDSL = require(path.join(__dirname, '../../../screener_engine/validation'));
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Supported alert types
const ALERT_TYPES = ['price', 'fundamental', 'event', 'time_based'];
const EVALUATION_FREQUENCIES = ['realtime', 'hourly', 'daily'];
const ALERT_STATUSES = ['active', 'paused', 'triggered'];

/**
 * Validate alert rule using DSL validation
 */
function validateAlertRule(alertRule) {
  try {
    // Alert rules should follow DSL structure
    // They can be a simple condition or a complex filter
    const ruleToValidate = alertRule.filter || alertRule;
    validateDSL({ filter: ruleToValidate });
    return true;
  } catch (error) {
    throw new Error(`Invalid alert rule: ${error.message}`);
  }
}

/**
 * Determine alert type from rule structure
 */
function inferAlertType(alertRule) {
  const rule = alertRule.filter || alertRule;
  
  // Check if it's a price-based alert (checks price or close fields)
  if (hasField(rule, 'price') || hasField(rule, 'close')) {
    return 'price';
  }
  
  // Check if it's event-based (checks for event fields)
  if (hasField(rule, 'buyback_announced') || hasField(rule, 'earnings_within_days')) {
    return 'event';
  }
  
  // Check if it's time-based (has time window conditions)
  if (hasTimeWindow(rule)) {
    return 'time_based';
  }
  
  // Default to fundamental (checks metrics like pe_ratio, revenue, etc.)
  return 'fundamental';
}

function hasField(node, fieldName) {
  if (!node || typeof node !== 'object') return false;
  
  if (node.field === fieldName) return true;
  
  if (node.and || node.or) {
    const group = node.and || node.or;
    return group.some(item => hasField(item, fieldName));
  }
  
  if (node.not) {
    return hasField(node.not, fieldName);
  }
  
  return false;
}

function hasTimeWindow(node) {
  if (!node || typeof node !== 'object') return false;
  
  if (node.window || node.period) return true;
  
  if (node.and || node.or) {
    const group = node.and || node.or;
    return group.some(item => hasTimeWindow(item));
  }
  
  if (node.not) {
    return hasTimeWindow(node.not);
  }
  
  return false;
}

/**
 * Create alert subscription
 */
async function createAlert(userId, ticker, alertRule, options = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Validate ticker exists
    const tickerCheck = await client.query(
      'SELECT ticker FROM companies WHERE ticker = $1',
      [ticker]
    );

    if (tickerCheck.rows.length === 0) {
      throw new Error(`Ticker ${ticker} not found in companies table`);
    }

    // Validate alert rule
    validateAlertRule(alertRule);

    // Infer alert type if not provided
    const alertType = options.alertType || inferAlertType(alertRule);
    if (!ALERT_TYPES.includes(alertType)) {
      throw new Error(`Invalid alert type: ${alertType}`);
    }

    const evaluationFrequency = options.evaluationFrequency || 'daily';
    if (!EVALUATION_FREQUENCIES.includes(evaluationFrequency)) {
      throw new Error(`Invalid evaluation frequency: ${evaluationFrequency}`);
    }

    const name = options.name || `Alert for ${ticker}`;
    const status = options.status || 'active';

    // Insert alert
    const result = await client.query(
      `INSERT INTO watchlist_alerts (
        user_id, ticker, alert_rule, name, alert_type, 
        evaluation_frequency, status, active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        id, user_id, ticker, alert_rule, name, alert_type,
        evaluation_frequency, status, active, created_at, updated_at`,
      [
        userId,
        ticker,
        JSON.stringify(alertRule),
        name,
        alertType,
        evaluationFrequency,
        status,
        status === 'active'
      ]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get user alerts
 */
async function getUserAlerts(userId, options = {}) {
  const { status, alertType, ticker } = options;
  
  let query = `
    SELECT 
      id, user_id, ticker, alert_rule, name, alert_type,
      evaluation_frequency, status, active, triggered_at,
      last_evaluated_at, notification_sent, created_at, updated_at
    FROM watchlist_alerts
    WHERE user_id = $1
  `;
  
  const params = [userId];
  let paramIndex = 2;
  
  if (status) {
    query += ` AND status = $${paramIndex++}`;
    params.push(status);
  }
  
  if (alertType) {
    query += ` AND alert_type = $${paramIndex++}`;
    params.push(alertType);
  }
  
  if (ticker) {
    query += ` AND ticker = $${paramIndex++}`;
    params.push(ticker);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get alert by ID
 */
async function getAlert(userId, alertId) {
  const result = await pool.query(
    `SELECT 
      id, user_id, ticker, alert_rule, name, alert_type,
      evaluation_frequency, status, active, triggered_at,
      last_evaluated_at, notification_sent, created_at, updated_at
    FROM watchlist_alerts
    WHERE id = $1 AND user_id = $2`,
    [alertId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Update alert
 */
async function updateAlert(userId, alertId, updates) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check ownership
    const existing = await client.query(
      'SELECT id FROM watchlist_alerts WHERE id = $1 AND user_id = $2',
      [alertId, userId]
    );

    if (existing.rows.length === 0) {
      throw new Error('Alert not found or access denied');
    }

    // Build update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.alertRule !== undefined) {
      validateAlertRule(updates.alertRule);
      updateFields.push(`alert_rule = $${paramIndex++}`);
      values.push(JSON.stringify(updates.alertRule));
    }

    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }

    if (updates.status !== undefined) {
      if (!ALERT_STATUSES.includes(updates.status)) {
        throw new Error(`Invalid status: ${updates.status}`);
      }
      updateFields.push(`status = $${paramIndex++}`);
      updateFields.push(`active = $${paramIndex++}`);
      values.push(updates.status);
      values.push(updates.status === 'active');
    }

    if (updates.evaluationFrequency !== undefined) {
      if (!EVALUATION_FREQUENCIES.includes(updates.evaluationFrequency)) {
        throw new Error(`Invalid evaluation frequency: ${updates.evaluationFrequency}`);
      }
      updateFields.push(`evaluation_frequency = $${paramIndex++}`);
      values.push(updates.evaluationFrequency);
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(alertId, userId);

    const result = await client.query(
      `UPDATE watchlist_alerts 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
       RETURNING 
         id, user_id, ticker, alert_rule, name, alert_type,
         evaluation_frequency, status, active, created_at, updated_at`,
      values
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete alert
 */
async function deleteAlert(userId, alertId) {
  const result = await pool.query(
    'DELETE FROM watchlist_alerts WHERE id = $1 AND user_id = $2 RETURNING id, ticker, name',
    [alertId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Alert not found or access denied');
  }

  return result.rows[0];
}

/**
 * Enable/disable alert
 */
async function toggleAlert(userId, alertId, active) {
  const status = active ? 'active' : 'paused';
  
  const result = await pool.query(
    `UPDATE watchlist_alerts 
     SET status = $1, active = $2
     WHERE id = $3 AND user_id = $4
     RETURNING id, status, active`,
    [status, active, alertId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Alert not found or access denied');
  }

  return result.rows[0];
}

module.exports = {
  createAlert,
  getUserAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
  toggleAlert,
  validateAlertRule
};
