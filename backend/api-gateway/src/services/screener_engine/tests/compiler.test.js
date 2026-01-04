const { compileDSL } = require("../compiler");

test("compiles single condition correctly", () => {
  const dsl = {
    filter: {
      and: [
        { field: "pe_ratio", operator: "<", value: 10 }
      ]
    }
  };

  const result = compileDSL(dsl);

  expect(result.whereClause).toBe("pe_ratio < $1");
  expect(result.values).toEqual([10]);
});

test("throws error for unsupported field", () => {
  const dsl = {
    filter: {
      and: [
        { field: "unknown_field", operator: "<", value: 10 }
      ]
    }
  };

  expect(() => compileDSL(dsl)).toThrow();
});
