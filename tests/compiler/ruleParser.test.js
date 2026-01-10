describe("Rule Parser Tests", () => {
  test("Parses simple comparison rule", () => {
    const rule = "peRatio < 20";
    const parsed = parseRule(rule);
    expect(parsed.field).toBe("peRatio");
    expect(parsed.operator).toBe("<");
    expect(parsed.value).toBe(20);
  });

  test("Rejects invalid rule syntax", () => {
    const rule = "peRatio <<< 20";
    expect(() => parseRule(rule)).toThrow();
  });
});
