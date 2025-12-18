const compileDSL = require('../compiler/screener_compiler');

describe('Screener Compiler', () => {
  test('compiles simple AND condition', () => {
    const dsl = {
      filter: {
        and: [
          { field: 'pe_ratio', operator: '<', value: 20 },
          { field: 'revenue_growth_yoy', operator: '>', value: 10 }
        ]
      }
    };

    const result = compileDSL(dsl);

    expect(result.sql).toContain('pe_ratio < $1');
    expect(result.sql).toContain('revenue_growth_yoy > $2');
    expect(result.params).toEqual([20, 10]);
  });

  test('rejects unsupported field', () => {
    const dsl = {
      filter: {
        and: [{ field: 'unknown_metric', operator: '<', value: 5 }]
      }
    };

    expect(() => compileDSL(dsl)).toThrow();
  });
});
