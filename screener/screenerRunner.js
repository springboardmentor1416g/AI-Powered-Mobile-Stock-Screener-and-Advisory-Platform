const stockData = require("./stockData.mock.json");

module.exports = function runScreener(filters) {
  return stockData.filter(stock =>
    filters.every(f => {
      switch (f.operator) {
        case "<":
          return stock[f.field] < f.value;
        case ">":
          return stock[f.field] > f.value;
        default:
          return false;
      }
    })
  );
};
