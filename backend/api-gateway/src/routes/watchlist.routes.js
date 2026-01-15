const express = require('express');
const router = express.Router();
const authMiddleware = require('../auth/auth.middleware');
const watchlistController = require('../controllers/watchlist.controller');

// All watchlist routes require authentication
router.use(authMiddleware);

router.post('/', watchlistController.createWatchlist);
router.get('/', watchlistController.getUserWatchlists);
router.get('/:watchlistId', watchlistController.getWatchlist);
router.put('/:watchlistId', watchlistController.updateWatchlistName);
router.delete('/:watchlistId', watchlistController.deleteWatchlist);

// Watchlist items
router.post('/:watchlistId/items', watchlistController.addToWatchlist);
router.delete('/:watchlistId/items/:ticker', watchlistController.removeFromWatchlist);

module.exports = router;
