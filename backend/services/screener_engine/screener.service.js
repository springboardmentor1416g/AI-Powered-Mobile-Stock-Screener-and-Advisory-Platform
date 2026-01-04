const { runScreener } = require("./runner");

async function screenStocks(dsl) {
  return await runScreener(dsl);
}

module.exports = { screenStocks };
