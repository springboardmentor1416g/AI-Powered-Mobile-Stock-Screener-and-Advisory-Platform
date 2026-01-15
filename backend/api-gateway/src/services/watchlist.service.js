const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Create a new watchlist for user
 */
async function createWatchlist(userId, name = 'My Watchlist') {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if watchlist with same name exists
    const existing = await client.query(
      'SELECT id FROM watchlists WHERE user_id = $1 AND name = $2',
      [userId, name]
    );

    if (existing.rows.length > 0) {
      throw new Error(`Watchlist "${name}" already exists`);
    }

    const result = await client.query(
      `INSERT INTO watchlists (user_id, name)
       VALUES ($1, $2)
       RETURNING id, user_id, name, created_at, updated_at`,
      [userId, name]
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
 * Get all watchlists for user
 */
async function getUserWatchlists(userId) {
  const result = await pool.query(
    `SELECT 
      w.id,
      w.name,
      w.created_at,
      w.updated_at,
      COUNT(wi.id) as item_count
    FROM watchlists w
    LEFT JOIN watchlist_items wi ON w.id = wi.watchlist_id
    WHERE w.user_id = $1
    GROUP BY w.id, w.name, w.created_at, w.updated_at
    ORDER BY w.created_at DESC`,
    [userId]
  );

  return result.rows;
}

/**
 * Get watchlist by ID (with items)
 */
async function getWatchlist(userId, watchlistId) {
  const watchlistResult = await pool.query(
    'SELECT id, user_id, name, created_at, updated_at FROM watchlists WHERE id = $1 AND user_id = $2',
    [watchlistId, userId]
  );

  if (watchlistResult.rows.length === 0) {
    return null;
  }

  const watchlist = watchlistResult.rows[0];

  // Get items
  const itemsResult = await pool.query(
    `SELECT 
      wi.id,
      wi.ticker,
      c.name as company_name,
      wi.added_at,
      wi.notes
    FROM watchlist_items wi
    LEFT JOIN companies c ON wi.ticker = c.ticker
    WHERE wi.watchlist_id = $1
    ORDER BY wi.added_at DESC`,
    [watchlistId]
  );

  watchlist.items = itemsResult.rows;
  return watchlist;
}

/**
 * Add stock to watchlist
 */
async function addToWatchlist(userId, watchlistId, ticker, notes = null) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify watchlist ownership
    const watchlistCheck = await client.query(
      'SELECT id FROM watchlists WHERE id = $1 AND user_id = $2',
      [watchlistId, userId]
    );

    if (watchlistCheck.rows.length === 0) {
      throw new Error('Watchlist not found or access denied');
    }

    // Validate ticker exists
    const tickerCheck = await client.query(
      'SELECT ticker FROM companies WHERE ticker = $1',
      [ticker]
    );

    if (tickerCheck.rows.length === 0) {
      throw new Error(`Ticker ${ticker} not found in companies table`);
    }

    // Check if already in watchlist
    const existing = await client.query(
      'SELECT id FROM watchlist_items WHERE watchlist_id = $1 AND ticker = $2',
      [watchlistId, ticker]
    );

    if (existing.rows.length > 0) {
      throw new Error(`Stock ${ticker} already exists in watchlist`);
    }

    // Insert item
    const result = await client.query(
      `INSERT INTO watchlist_items (watchlist_id, ticker, notes)
       VALUES ($1, $2, $3)
       RETURNING id, watchlist_id, ticker, added_at, notes`,
      [watchlistId, ticker, notes]
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
 * Remove stock from watchlist
 */
async function removeFromWatchlist(userId, watchlistId, ticker) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify watchlist ownership
    const watchlistCheck = await client.query(
      'SELECT id FROM watchlists WHERE id = $1 AND user_id = $2',
      [watchlistId, userId]
    );

    if (watchlistCheck.rows.length === 0) {
      throw new Error('Watchlist not found or access denied');
    }

    const result = await client.query(
      'DELETE FROM watchlist_items WHERE watchlist_id = $1 AND ticker = $2 RETURNING id, ticker',
      [watchlistId, ticker]
    );

    if (result.rows.length === 0) {
      throw new Error(`Stock ${ticker} not found in watchlist`);
    }

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
 * Delete watchlist
 */
async function deleteWatchlist(userId, watchlistId) {
  const result = await pool.query(
    'DELETE FROM watchlists WHERE id = $1 AND user_id = $2 RETURNING id, name',
    [watchlistId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Watchlist not found or access denied');
  }

  return result.rows[0];
}

/**
 * Update watchlist name
 */
async function updateWatchlistName(userId, watchlistId, name) {
  const result = await pool.query(
    `UPDATE watchlists 
     SET name = $1 
     WHERE id = $2 AND user_id = $3
     RETURNING id, name, updated_at`,
    [name, watchlistId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Watchlist not found or access denied');
  }

  return result.rows[0];
}

module.exports = {
  createWatchlist,
  getUserWatchlists,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  deleteWatchlist,
  updateWatchlistName
};
