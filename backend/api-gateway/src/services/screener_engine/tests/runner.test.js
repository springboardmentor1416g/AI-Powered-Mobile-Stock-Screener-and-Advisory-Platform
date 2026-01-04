const testData = require("./test_data");

test("filters stocks with pe_ratio < 10", () => {
  const result = testData.filter(stock => stock.pe_ratio < 10);
  expect(result.length).toBe(1);
  expect(result[0].symbol).toBe("AAA");
});
