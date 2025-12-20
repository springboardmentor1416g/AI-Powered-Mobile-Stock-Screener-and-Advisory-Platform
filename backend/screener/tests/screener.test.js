const { compileScreener } = require("../compiler/compile");

test("revenue greater than condition", () => {
  const rule = {
    conditions: [{ field: "revenue", operator: ">", value: 100 }]
  };

  const fn = compileScreener(rule);

  expect(fn({ revenue: 200 })).toBe(true);
  expect(fn({ revenue: 50 })).toBe(false);
});
