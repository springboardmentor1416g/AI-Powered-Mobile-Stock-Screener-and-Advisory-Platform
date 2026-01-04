jest.mock("../../../db", () => ({
  query: jest.fn()
}));
const pool = require("../../../db");
const { runScreener } = require("../runner");

beforeEach(() => {
  pool.query.mockReset();
});

test("returns stocks with PE < 15", async () => {
  pool.query.mockResolvedValue({
    rows: [{ ticker: "AAPL" }]
  });

  const dsl = {
    filter: {
      and: [
        { field: "pe_ratio", operator: "<", value: 15 }
      ]
    }
  };

  const result = await runScreener(dsl);

  expect(pool.query).toHaveBeenCalled();
  expect(result).toEqual([{ ticker: "AAPL" }]);
});

test("returns empty when no match", async () => {
  pool.query.mockResolvedValue({
    rows: []
  });

  const dsl = {
    filter: {
      and: [
        { field: "pe_ratio", operator: "<", value: 5 }
      ]
    }
  };

  const result = await runScreener(dsl);

  expect(result).toEqual([]);
});
