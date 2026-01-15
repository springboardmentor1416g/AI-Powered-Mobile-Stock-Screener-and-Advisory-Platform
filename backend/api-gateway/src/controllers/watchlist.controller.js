const watchlistService = require('../services/watchlist.service');

/**
 * Create watchlist
 * POST /api/v1/watchlists
 */
exports.createWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    const watchlist = await watchlistService.createWatchlist(
      userId,
      name || 'My Watchlist'
    );

    res.status(201).json({
      success: true,
      message: 'Watchlist created',
      data: watchlist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user watchlists
 * GET /api/v1/watchlists
 */
exports.getUserWatchlists = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const watchlists = await watchlistService.getUserWatchlists(userId);

    res.json({
      success: true,
      data: watchlists,
      count: watchlists.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get watchlist by ID
 * GET /api/v1/watchlists/:watchlistId
 */
exports.getWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { watchlistId } = req.params;

    const watchlist = await watchlistService.getWatchlist(userId, parseInt(watchlistId));

    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist not found',
        error_code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: watchlist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add stock to watchlist
 * POST /api/v1/watchlists/:watchlistId/items
 */
exports.addToWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { watchlistId } = req.params;
    const { ticker, notes } = req.body;

    if (!ticker) {
      return res.status(400).json({
        success: false,
        message: 'Ticker is required',
        error_code: 'BAD_REQUEST'
      });
    }

    const item = await watchlistService.addToWatchlist(
      userId,
      parseInt(watchlistId),
      ticker,
      notes || null
    );

    res.status(201).json({
      success: true,
      message: 'Stock added to watchlist',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove stock from watchlist
 * DELETE /api/v1/watchlists/:watchlistId/items/:ticker
 */
exports.removeFromWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { watchlistId, ticker } = req.params;

    const result = await watchlistService.removeFromWatchlist(
      userId,
      parseInt(watchlistId),
      ticker
    );

    res.json({
      success: true,
      message: 'Stock removed from watchlist',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update watchlist name
 * PUT /api/v1/watchlists/:watchlistId
 */
exports.updateWatchlistName = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { watchlistId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
        error_code: 'BAD_REQUEST'
      });
    }

    const watchlist = await watchlistService.updateWatchlistName(
      userId,
      parseInt(watchlistId),
      name
    );

    res.json({
      success: true,
      message: 'Watchlist updated',
      data: watchlist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete watchlist
 * DELETE /api/v1/watchlists/:watchlistId
 */
exports.deleteWatchlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { watchlistId } = req.params;

    const result = await watchlistService.deleteWatchlist(
      userId,
      parseInt(watchlistId)
    );

    res.json({
      success: true,
      message: 'Watchlist deleted',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
