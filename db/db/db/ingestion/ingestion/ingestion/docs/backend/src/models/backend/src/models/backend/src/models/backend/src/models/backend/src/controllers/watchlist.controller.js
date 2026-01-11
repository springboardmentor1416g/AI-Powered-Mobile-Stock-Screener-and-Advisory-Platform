const Watchlist = require("../models/Watchlist");

exports.getWatchlist = async (req, res) => {
  const data = await Watchlist.find({ userId: req.user.id });
  res.json(data);
};

exports.addWatchlist = async (req, res) => {
  const item = await Watchlist.create({
    userId: req.user.id,
    stockId: req.body.stockId
  });
  res.json(item);
};

exports.removeWatchlist = async (req, res) => {
  await Watchlist.findByIdAndDelete(req.params.id);
  res.json({ message: "Removed from watchlist" });
};
