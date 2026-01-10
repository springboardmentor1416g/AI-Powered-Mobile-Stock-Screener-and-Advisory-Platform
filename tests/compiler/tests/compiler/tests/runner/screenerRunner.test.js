const stocks = require("../data/sampleStockData.json");

describe("Screener Runner Tests", () => {
  test("Returns matching stocks", () => {
    const rule = stock => stock.peRatio < 20;
    const result = runScreener(stocks, rule);
    expect(result.length).toBeGreaterThan(0);
  });

  test("Handles no-match scenario", () => {
    const rule = stock => stock.peRatio < 1;
    const result = runScreener(stocks, rule);
    expect(result).toEqual([]);
  });
});
