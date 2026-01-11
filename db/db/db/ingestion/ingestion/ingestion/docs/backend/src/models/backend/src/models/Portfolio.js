const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema({
  userId: String,
  stockId: String,
  quantity: Number,
  avgBuyPrice: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Portfolio", PortfolioSchema);
