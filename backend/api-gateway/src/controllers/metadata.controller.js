const metadataService = require('../services/metadata.service');

exports.getStocks = async (req, res, next) => {
  try {
    const stocks = await metadataService.fetchStocks();
    res.json(stocks);
  } catch (err) {
    next(err);
  }
};
