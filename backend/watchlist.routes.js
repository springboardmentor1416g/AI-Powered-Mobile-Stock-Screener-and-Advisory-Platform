// backend/watchlist.routes.js
const express = require('express');
const router = express.Router();

const {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist
} = require('./watchlist.store');

// TEMP user (no auth yet)
const USER_ID = 1;

/**
 * GET /watchlist
 * Get user watchlist
 */
router.get('/', (req, res) => {
  const list = getWatchlist(USER_ID);
  res.json({
    status: 'success',
    data: list
  });
});

/**
 * POST /watchlist
 * Add stock to watchlist
 * body: { symbol }
 */
router.post('/', (req, res) => {
  const { symbol } = req.body;

  if (!symbol) {
    return res.status(400).json({
      status: 'error',
      message: 'Symbol is required'
    });
  }

  const added = addToWatchlist(USER_ID, symbol.toUpperCase());

  if (!added) {
    return res.status(409).json({
      status: 'error',
      message: 'Stock already in watchlist'
    });
  }

  res.json({
    status: 'success',
    message: `${symbol} added to watchlist`
  });
});

/**
 * DELETE /watchlist/:symbol
 * Remove stock from watchlist
 */
router.delete('/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  const removed = removeFromWatchlist(USER_ID, symbol);

  if (!removed) {
    return res.status(404).json({
      status: 'error',
      message: 'Stock not found in watchlist'
    });
  }

  res.json({
    status: 'success',
    message: `${symbol} removed from watchlist`
  });
});

module.exports = router;
