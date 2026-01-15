// backend/watchlist.store.js

// Temporary in-memory store (no DB, no auth)
const watchlist = [];

/**
 * Add stock to watchlist
 */
function addToWatchlist(userId, symbol) {
  const exists = watchlist.find(
    item => item.user_id === userId && item.symbol === symbol
  );
  if (exists) return false;

  watchlist.push({ user_id: userId, symbol });
  return true;
}

/**
 * Get watchlist for user
 */
function getWatchlist(userId) {
  return watchlist.filter(item => item.user_id === userId);
}

/**
 * Remove stock from watchlist
 */
function removeFromWatchlist(userId, symbol) {
  const index = watchlist.findIndex(
    item => item.user_id === userId && item.symbol === symbol
  );
  if (index === -1) return false;

  watchlist.splice(index, 1);
  return true;
}

module.exports = {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist
};
