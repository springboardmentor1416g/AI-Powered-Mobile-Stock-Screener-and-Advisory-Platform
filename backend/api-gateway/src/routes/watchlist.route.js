const router = require('express').Router();
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  checkInWatchlist
} = require('../controllers/watchlist.controller');

router.get('/', getWatchlist);
router.post('/add', addToWatchlist);
router.post('/remove', removeFromWatchlist);
router.get('/check', checkInWatchlist);

module.exports = router;
