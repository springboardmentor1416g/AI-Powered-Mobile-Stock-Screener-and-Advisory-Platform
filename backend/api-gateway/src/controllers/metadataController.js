// const db = require('../config/database');
// const logger = require('../config/logger');
// const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * Get list of available stock symbols with metadata
 */
const stocks = async (req, res) => {
  // Mock data
  const mockStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Consumer Electronics', market_cap: 2800000000000 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Software', market_cap: 3100000000000 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology', industry: 'Internet Services', market_cap: 1800000000000 }
  ];

  res.json({
    success: true,
    count: mockStocks.length,
    stocks: mockStocks
  });
};

module.exports = { stocks };