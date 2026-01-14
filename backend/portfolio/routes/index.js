const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');

router.post('/watchlist/add', watchlistController.addToWatchlist);
router.get('/watchlist/:userId', watchlistController.getWatchlist);

module.exports = router;