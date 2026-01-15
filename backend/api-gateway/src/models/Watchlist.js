const mongoose = require("mongoose");

const WatchlistSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  stock_id: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Watchlist", WatchlistSchema);
