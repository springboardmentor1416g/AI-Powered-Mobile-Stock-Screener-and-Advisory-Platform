const mongoose = require("mongoose");

const WatchlistSchema = new mongoose.Schema({
  userId: String,
  stockId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Watchlist", WatchlistSchema);
