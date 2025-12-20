const stocks = require("../services/stocks.service");

exports.getStocks = (req, res) => {
  res.status(200).json(stocks);
};
