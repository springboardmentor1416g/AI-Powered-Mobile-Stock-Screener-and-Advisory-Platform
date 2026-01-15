const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema({
  user_id: String,
  stock_id: String,
  quantity: Number,
  avg_buy_price: Number,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Portfolio", PortfolioSchema);
