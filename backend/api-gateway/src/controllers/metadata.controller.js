const { getStocks } = require("../services/metadata.service");

exports.getStocksMetadata = (req, res) => {
  res.json(getStocks());
};
