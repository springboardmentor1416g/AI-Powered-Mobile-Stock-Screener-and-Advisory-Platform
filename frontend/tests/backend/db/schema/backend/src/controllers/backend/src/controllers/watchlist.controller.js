exports.addToWatchlist = async (req, res) => {
  res.json({ message: "Stock added to watchlist" });
};

exports.removeFromWatchlist = async (req, res) => {
  res.json({ message: "Stock removed from watchlist" });
};

exports.getWatchlists = async (req, res) => {
  res.json({ watchlists: [] });
};
