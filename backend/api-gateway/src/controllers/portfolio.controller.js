const portfolioService = require('../services/portfolio.service');

const getPortfolio = (req, res) => {
  try {
    const userId = req.query.userId || 'default-user';
    const portfolio = portfolioService.getPortfolio(userId);
    res.json({
      success: true,
      portfolio
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const addHolding = (req, res) => {
  try {
    const { symbol, stockData, quantity, costPrice } = req.body;
    const userId = req.query.userId || 'default-user';

    if (!symbol || !stockData || !quantity || !costPrice) {
      return res.status(400).json({
        success: false,
        error: 'Symbol, stockData, quantity, and costPrice are required'
      });
    }

    const portfolio = portfolioService.addHolding(symbol, stockData, quantity, costPrice, userId);
    res.json({
      success: true,
      message: `${quantity} shares of ${symbol} added to portfolio`,
      portfolio
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateHolding = (req, res) => {
  try {
    const { symbol, quantity, costPrice } = req.body;
    const userId = req.query.userId || 'default-user';

    if (!symbol || quantity === undefined || !costPrice) {
      return res.status(400).json({
        success: false,
        error: 'Symbol, quantity, and costPrice are required'
      });
    }

    const portfolio = portfolioService.updateHolding(symbol, quantity, costPrice, userId);
    res.json({
      success: true,
      message: `${symbol} holding updated`,
      portfolio
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const removeHolding = (req, res) => {
  try {
    const { symbol } = req.body;
    const userId = req.query.userId || 'default-user';

    if (!symbol) {
      return res.status(400).json({ success: false, error: 'Symbol required' });
    }

    const portfolio = portfolioService.removeHolding(symbol, userId);
    res.json({
      success: true,
      message: `${symbol} removed from portfolio`,
      portfolio
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getHolding = (req, res) => {
  try {
    const { symbol } = req.query;
    const userId = req.query.userId || 'default-user';

    if (!symbol) {
      return res.status(400).json({ success: false, error: 'Symbol required' });
    }

    const holding = portfolioService.getHolding(symbol, userId);
    res.json({
      success: true,
      holding: holding || null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getPortfolio,
  addHolding,
  updateHolding,
  removeHolding,
  getHolding
};
