async function evaluate(stockId, condition) {
  // Example condition:
  // { metric: "price", operator: "<", value: 500 }

  const stockData = await fetchStockData(stockId);

  switch (condition.operator) {
    case "<":
      return stockData[condition.metric] < condition.value;
    case ">":
      return stockData[condition.metric] > condition.value;
    default:
      return false;
  }
}

async function fetchStockData(stockId) {
  // TEMP stub – replace with real data source
  return {
    price: 480,
    peg: 0.9
  };
}

module.exports = { evaluate };
