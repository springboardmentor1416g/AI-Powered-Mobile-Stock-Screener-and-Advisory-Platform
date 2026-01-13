const service = require("../services/portfolio.service");

exports.addStock = async (req, res) => {
  const userId = req.user.id;
  const { symbol, quantity, avgBuyPrice } = req.body;

  const result = await service.addStock(userId, symbol, quantity, avgBuyPrice);
  res.status(201).json(result);
};

exports.getPortfolio = async (req, res) => {
  const data = await service.getPortfolio(req.user.id);
  res.json(data);
};
