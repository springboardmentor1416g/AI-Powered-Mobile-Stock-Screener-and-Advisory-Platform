const { v4: uuid } = require("uuid");

exports.addStock = async (userId, symbol, quantity, avgBuyPrice) => {
  // validate symbol elsewhere
  // check duplicate holding
  // insert holding
  return {
    message: "Stock added to portfolio",
    symbol,
    quantity,
    avgBuyPrice
  };
};

exports.getPortfolio = async (userId) => {
  return {
    userId,
    holdings: []
  };
};
