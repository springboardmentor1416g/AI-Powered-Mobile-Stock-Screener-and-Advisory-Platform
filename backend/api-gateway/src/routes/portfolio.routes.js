const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/auth.middleware');
const portfolioController = require('../controllers/portfolio.controller');

// All portfolio routes require authentication
router.use(authMiddleware);

router.post('/', portfolioController.addToPortfolio);
router.get('/', portfolioController.getPortfolio);
router.get('/:ticker', portfolioController.getPortfolioEntry);
router.put('/:ticker', portfolioController.updatePortfolioEntry);
router.delete('/:ticker', portfolioController.removeFromPortfolio);

module.exports = router;
