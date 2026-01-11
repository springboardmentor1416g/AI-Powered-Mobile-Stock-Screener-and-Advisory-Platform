const Portfolio = require("../models/Portfolio");

exports.getPortfolio = async (req, res) => {
  res.json(await Portfolio.find({ userId: req.user.id }));
};

exports.addHolding = async (req, res) => {
  res.json(await Portfolio.create({ ...req.body, userId: req.user.id }));
};

exports.updateHolding = async (req, res) => {
  res.json(await Portfolio.findByIdAndUpdate(req.params.id, req.body));
};
