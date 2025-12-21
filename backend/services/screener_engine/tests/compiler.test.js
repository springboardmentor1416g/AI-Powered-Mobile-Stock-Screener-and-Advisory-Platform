const { compileFilter } = require("../compiler");

test("compile simple less-than condition", () => {
  const params = [];
  const dsl = {
    and: [{ field: "pe_ratio", operator: "<", value: 15 }]
  };

  const where = compileFilter(dsl, params);

  expect(where).toBe("fundamentals.pe_ratio < $1");
  expect(params).toEqual([15]);
});
test("compile AND conditions", () => {
  const params = [];
  const dsl = {
    and: [
      { field: "pe_ratio", operator: "<", value: 20 },
      { field: "roe", operator: ">", value: 15 }
    ]
  };

  const where = compileFilter(dsl, params);

  expect(where).toBe(
    "fundamentals.pe_ratio < $1 AND fundamentals.roe > $2"
  );
  expect(params).toEqual([20, 15]);
});
test("reject invalid field", () => {
  const params = [];
  const dsl = {
    and: [{ field: "fake_field", operator: "<", value: 10 }]
  };

  expect(() => compileFilter(dsl, params)).toThrow();
});
