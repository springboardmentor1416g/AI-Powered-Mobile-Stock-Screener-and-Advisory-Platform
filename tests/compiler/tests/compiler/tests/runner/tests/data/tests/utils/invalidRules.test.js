describe("Invalid Rule Handling", () => {
  test("Throws error for null rule", () => {
    expect(() => compileRule(null)).toThrow();
  });

  test("Throws error for unsupported operator", () => {
    const rule = { field: "peRatio", operator: "!==", value: 10 };
    expect(() => compileRule(rule)).toThrow();
  });
});
