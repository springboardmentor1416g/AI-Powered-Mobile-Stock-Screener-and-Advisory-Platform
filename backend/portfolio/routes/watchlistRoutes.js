const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');

// Define Routes
router.post('/add', watchlistController.addToWatchlist);       // POST /api/watchlist/add
router.get('/:userId', watchlistController.getWatchlist);      // GET /api/watchlist/:userId
router.delete('/remove', watchlistController.removeFromWatchlist); // DELETE /api/watchlist/remove

module.exports = router;