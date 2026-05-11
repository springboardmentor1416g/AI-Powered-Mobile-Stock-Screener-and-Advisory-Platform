const watchlistService = require('../services/watchlist.service');

const getWatchlist = (req, res) => {
  try {
    const userId = req.query.userId || 'default-user';
    const watchlist = watchlistService.getWatchlist(userId);
    res.json({
      success: true,
      count: watchlist.length,
      watchlist
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addToWatchlist = (req, res) => {
  try {
    const { symbol, stockData } = req.body;
    const userId = req.query.userId || 'default-user';

    if (!symbol || !stockData) {
      return res.status(400).json({ success: false, error: 'Symbol and stockData required' });
    }

    const watchlist = watchlistService.addToWatchlist(symbol, stockData, userId);
    res.json({
      success: true,
      message: `${symbol} added to watchlist`,
      watchlist
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const removeFromWatchlist = (req, res) => {
  try {
    const { symbol } = req.body;
    const userId = req.query.userId || 'default-user';

    if (!symbol) {
      return res.status(400).json({ success: false, error: 'Symbol required' });
    }

    const watchlist = watchlistService.removeFromWatchlist(symbol, userId);
    res.json({
      success: true,
      message: `${symbol} removed from watchlist`,
      watchlist
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const checkInWatchlist = (req, res) => {
  try {
    const { symbol } = req.query;
    const userId = req.query.userId || 'default-user';

    if (!symbol) {
      return res.status(400).json({ success: false, error: 'Symbol required' });
    }

    const isInWatchlist = watchlistService.isInWatchlist(symbol, userId);
    res.json({
      success: true,
      symbol,
      inWatchlist: isInWatchlist
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  checkInWatchlist
};
