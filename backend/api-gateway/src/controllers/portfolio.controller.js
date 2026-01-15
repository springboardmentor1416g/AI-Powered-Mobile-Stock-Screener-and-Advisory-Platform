const portfolioService = require('../services/portfolio.service');

/**
 * Add stock to portfolio
 * POST /api/v1/portfolio
 */
exports.addToPortfolio = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { ticker, quantity, avgPrice } = req.body;

    if (!ticker) {
      return res.status(400).json({
        success: false,
        message: 'Ticker is required',
        error_code: 'BAD_REQUEST'
      });
    }

    const portfolioEntry = await portfolioService.addToPortfolio(
      userId,
      ticker,
      quantity || null,
      avgPrice || null
    );

    res.status(201).json({
      success: true,
      message: 'Stock added to portfolio',
      data: portfolioEntry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update portfolio entry
 * PUT /api/v1/portfolio/:ticker
 */
exports.updatePortfolioEntry = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { ticker } = req.params;
    const { quantity, avgPrice } = req.body;

    const portfolioEntry = await portfolioService.updatePortfolioEntry(
      userId,
      ticker,
      quantity,
      avgPrice
    );

    res.json({
      success: true,
      message: 'Portfolio entry updated',
      data: portfolioEntry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove stock from portfolio
 * DELETE /api/v1/portfolio/:ticker
 */
exports.removeFromPortfolio = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { ticker } = req.params;

    const result = await portfolioService.removeFromPortfolio(userId, ticker);

    res.json({
      success: true,
      message: 'Stock removed from portfolio',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user portfolio
 * GET /api/v1/portfolio
 */
exports.getPortfolio = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const portfolio = await portfolioService.getPortfolio(userId);

    res.json({
      success: true,
      data: portfolio,
      count: portfolio.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get portfolio entry by ticker
 * GET /api/v1/portfolio/:ticker
 */
exports.getPortfolioEntry = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { ticker } = req.params;

    const entry = await portfolioService.getPortfolioEntry(userId, ticker);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio entry not found',
        error_code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};
