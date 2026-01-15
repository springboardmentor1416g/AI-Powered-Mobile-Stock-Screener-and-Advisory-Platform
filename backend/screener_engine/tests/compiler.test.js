const compileDSL = require('../compiler/screener_compiler');

describe('Screener Compiler', () => {
  test('compiles simple AND condition', () => {
    const dsl = {
      filter: {
        and: [
          { field: 'pe_ratio', operator: '<', value: 20 },
          { field: 'revenue', operator: '>', value: 1000 }
        ]
      }
    };

    const result = compileDSL(dsl);

    expect(result.sql).toContain('pe_ratio');
    expect(result.sql).toContain('revenue');
    expect(result.params).toContain(20);
    expect(result.params).toContain(1000);
  });

  test('rejects unsupported field', () => {
    const dsl = {
      filter: {
        and: [{ field: 'unknown_metric', operator: '<', value: 5 }]
      }
    };

    expect(() => compileDSL(dsl)).toThrow();
  });

  test('compiles OR condition', () => {
    const dsl = {
      filter: {
        or: [
          { field: 'pe_ratio', operator: '<', value: 10 },
          { field: 'pe_ratio', operator: '>', value: 30 }
        ]
      }
    };

    const result = compileDSL(dsl);
    expect(result.sql).toContain('OR');
  });
});
