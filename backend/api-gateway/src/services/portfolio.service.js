const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Add stock to user portfolio
 */
async function addToPortfolio(userId, ticker, quantity = null, avgPrice = null) {
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

    // Check if already exists
    const existing = await client.query(
      'SELECT id FROM user_portfolio WHERE user_id = $1 AND ticker = $2',
      [userId, ticker]
    );

    if (existing.rows.length > 0) {
      throw new Error(`Stock ${ticker} already exists in portfolio`);
    }

    // Insert new portfolio entry
    const result = await client.query(
      `INSERT INTO user_portfolio (user_id, ticker, quantity, avg_price)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, ticker, quantity, avg_price, created_at, updated_at`,
      [userId, ticker, quantity, avgPrice]
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
 * Update portfolio entry
 */
async function updatePortfolioEntry(userId, ticker, quantity = null, avgPrice = null) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check ownership
    const existing = await client.query(
      'SELECT id FROM user_portfolio WHERE user_id = $1 AND ticker = $2',
      [userId, ticker]
    );

    if (existing.rows.length === 0) {
      throw new Error(`Stock ${ticker} not found in portfolio`);
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (quantity !== null && quantity !== undefined) {
      updates.push(`quantity = $${paramIndex++}`);
      values.push(quantity);
    }

    if (avgPrice !== null && avgPrice !== undefined) {
      updates.push(`avg_price = $${paramIndex++}`);
      values.push(avgPrice);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId, ticker);

    const result = await client.query(
      `UPDATE user_portfolio 
       SET ${updates.join(', ')}
       WHERE user_id = $${paramIndex++} AND ticker = $${paramIndex++}
       RETURNING id, user_id, ticker, quantity, avg_price, created_at, updated_at`,
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
 * Remove stock from portfolio
 */
async function removeFromPortfolio(userId, ticker) {
  const result = await pool.query(
    'DELETE FROM user_portfolio WHERE user_id = $1 AND ticker = $2 RETURNING id, ticker',
    [userId, ticker]
  );

  if (result.rows.length === 0) {
    throw new Error(`Stock ${ticker} not found in portfolio`);
  }

  return result.rows[0];
}

/**
 * Get user portfolio summary
 */
async function getPortfolio(userId) {
  const result = await pool.query(
    `SELECT 
      up.id,
      up.ticker,
      c.name as company_name,
      up.quantity,
      up.avg_price,
      up.created_at,
      up.updated_at
    FROM user_portfolio up
    LEFT JOIN companies c ON up.ticker = c.ticker
    WHERE up.user_id = $1
    ORDER BY up.created_at DESC`,
    [userId]
  );

  return result.rows;
}

/**
 * Get portfolio entry by ticker
 */
async function getPortfolioEntry(userId, ticker) {
  const result = await pool.query(
    `SELECT 
      up.id,
      up.ticker,
      c.name as company_name,
      up.quantity,
      up.avg_price,
      up.created_at,
      up.updated_at
    FROM user_portfolio up
    LEFT JOIN companies c ON up.ticker = c.ticker
    WHERE up.user_id = $1 AND up.ticker = $2`,
    [userId, ticker]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

module.exports = {
  addToPortfolio,
  updatePortfolioEntry,
  removeFromPortfolio,
  getPortfolio,
  getPortfolioEntry
};
