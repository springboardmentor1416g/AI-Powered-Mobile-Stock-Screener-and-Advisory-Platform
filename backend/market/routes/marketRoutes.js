const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

// Define Routes
router.get('/:ticker', marketController.getStockDetails);          // GET /api/stocks/AAPL
router.get('/:ticker/history', marketController.getStockHistory);  // GET /api/stocks/AAPL/history

module.exports = router;