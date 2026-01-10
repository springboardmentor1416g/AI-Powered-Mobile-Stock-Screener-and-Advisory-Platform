describe("Rule Compiler Tests", () => {
  test("Compiles single condition correctly", () => {
    const rule = { field: "marketCap", operator: ">", value: 1000 };
    const fn = compileRule(rule);
    expect(fn({ marketCap: 1500 })).toBe(true);
  });

  test("AND logic preserves meaning", () => {
    const rules = [
      { field: "peRatio", operator: "<", value: 20 },
      { field: "growth", operator: ">", value: 10 }
    ];
    const fn = compileAndRules(rules);
    expect(fn({ peRatio: 15, growth: 12 })).toBe(true);
  });
});
