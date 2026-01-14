const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// GET /api/portfolio/:userId
router.get('/:userId', portfolioController.getPortfolio);

module.exports = router;