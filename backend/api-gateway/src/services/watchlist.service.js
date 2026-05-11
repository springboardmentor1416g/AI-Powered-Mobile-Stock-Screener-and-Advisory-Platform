// In-memory watchlist store (replace with DB later)
let watchlists = {};

const getOrCreateUserWatchlist = (userId = 'default-user') => {
  if (!watchlists[userId]) {
    watchlists[userId] = [];
  }
  return watchlists[userId];
};

const addToWatchlist = (symbol, stockData, userId = 'default-user') => {
  const list = getOrCreateUserWatchlist(userId);
  const exists = list.find(s => s.symbol === symbol);
  if (!exists) {
    list.push({
      symbol,
      name: stockData.name,
      sector: stockData.sector,
      price: stockData.price,
      peRatio: stockData.pe_ratio,
      addedAt: new Date().toISOString(),
      ...stockData
    });
  }
  return list;
};

const removeFromWatchlist = (symbol, userId = 'default-user') => {
  const list = getOrCreateUserWatchlist(userId);
  watchlists[userId] = list.filter(s => s.symbol !== symbol);
  return watchlists[userId];
};

const getWatchlist = (userId = 'default-user') => {
  return getOrCreateUserWatchlist(userId);
};

const isInWatchlist = (symbol, userId = 'default-user') => {
  const list = getOrCreateUserWatchlist(userId);
  return list.some(s => s.symbol === symbol);
};

module.exports = {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  isInWatchlist,
  getOrCreateUserWatchlist
};
