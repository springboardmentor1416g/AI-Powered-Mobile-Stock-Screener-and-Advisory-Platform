const compileDSL = require('../compiler/screener_compiler');
const validateDSL = require('../validation');

describe('Extended DSL Compiler', () => {
  describe('Range Conditions', () => {
    test('compiles range condition with min and max', () => {
      const dsl = {
        filter: {
          and: [
            {
              field: 'pe_ratio',
              range: {
                min: 5,
                max: 15,
                inclusive: true
              }
            }
          ]
        }
      };

      validateDSL(dsl);
      const result = compileDSL(dsl);
      
      expect(result.sql).toContain('pe_ratio');
      expect(result.sql).toContain('BETWEEN');
      expect(result.params).toContain(5);
      expect(result.params).toContain(15);
    });

    test('compiles range condition with min only', () => {
      const dsl = {
        filter: {
          and: [
            {
              field: 'pe_ratio',
              range: {
                min: 10,
                inclusive: true
              }
            }
          ]
        }
      };

      validateDSL(dsl);
      const result = compileDSL(dsl);
      
      expect(result.sql).toContain('>=');
      expect(result.params).toContain(10);
    });
  });

  describe('Window Conditions', () => {
    test('compiles window condition with aggregation', () => {
      const dsl = {
        filter: {
          and: [
            {
              field: 'revenue',
              operator: '>',
              value: 1000,
              window: {
                type: 'quarters',
                length: 4,
                aggregation: 'avg'
              }
            }
          ]
        }
      };

      validateDSL(dsl);
      const result = compileDSL(dsl);
      
      expect(result.sql).toContain('AVG');
      expect(result.sql).toContain('fundamentals_quarterly');
      expect(result.params).toContain(1000);
    });

    test('compiles CAGR window condition', () => {
      const dsl = {
        filter: {
          and: [
            {
              field: 'revenue',
              operator: '>',
              value: 10,
              window: {
                type: 'years',
                length: 3,
                aggregation: 'cagr'
              }
            }
          ]
        }
      };

      validateDSL(dsl);
      const result = compileDSL(dsl);
      
      expect(result.sql).toContain('POWER');
      expect(result.sql).toContain('fundamentals_annual');
    });
  });

  describe('Logical Operators', () => {
    test('compiles OR filter', () => {
      const dsl = {
        filter: {
          or: [
            { field: 'pe_ratio', operator: '<', value: 10 },
            { field: 'pe_ratio', operator: '>', value: 30 }
          ]
        }
      };

      validateDSL(dsl);
      const result = compileDSL(dsl);
      
      expect(result.sql).toContain('OR');
      expect(result.params.length).toBe(2);
    });

    test('compiles nested AND/OR', () => {
      const dsl = {
        filter: {
          and: [
            { field: 'pe_ratio', operator: '<', value: 20 },
            {
              or: [
                { field: 'revenue', operator: '>', value: 1000 },
                { field: 'eps', operator: '>', value: 5 }
              ]
            }
          ]
        }
      };

      validateDSL(dsl);
      const result = compileDSL(dsl);
      
      expect(result.sql).toContain('AND');
      expect(result.sql).toContain('OR');
    });

    test('compiles NOT operator', () => {
      const dsl = {
        filter: {
          not: {
            field: 'pe_ratio',
            operator: '<',
            value: 5
          }
        }
      };

      validateDSL(dsl);
      const result = compileDSL(dsl);
      
      expect(result.sql).toContain('NOT');
    });
  });

  describe('Derived Metrics', () => {
    test('identifies derived metrics in DSL', () => {
      const dsl = {
        filter: {
          and: [
            { field: 'peg_ratio', operator: '<', value: 1.5 }
          ]
        }
      };

      validateDSL(dsl);
      const result = compileDSL(dsl);
      
      expect(result.derivedMetrics).toBeDefined();
      expect(result.derivedMetrics.length).toBe(1);
      expect(result.derivedMetrics[0].field).toBe('peg_ratio');
    });

    test('handles derived metrics with window', () => {
      const dsl = {
        filter: {
          and: [
            {
              field: 'eps_cagr',
              operator: '>',
              value: 10,
              window: {
                type: 'years',
                length: 3
              }
            }
          ]
        }
      };

      validateDSL(dsl);
      const result = compileDSL(dsl);
      
      expect(result.derivedMetrics).toBeDefined();
      expect(result.derivedMetrics[0].window).toBeDefined();
    });
  });

  describe('Null Handling', () => {
    test('compiles condition with on_missing policy', () => {
      const dsl = {
        filter: {
          and: [
            {
              field: 'pe_ratio',
              operator: '<',
              value: 20,
              on_missing: 'fail'
            }
          ]
        }
      };

      validateDSL(dsl);
      const result = compileDSL(dsl);
      
      expect(result.sql).toContain('IS NOT NULL');
    });
  });
});

describe('DSL Validation', () => {
  test('rejects conflicting conditions', () => {
    const dsl = {
      filter: {
        and: [
          { field: 'pe_ratio', operator: '<', value: 5 },
          { field: 'pe_ratio', operator: '>', value: 50 }
        ]
      }
    };

    expect(() => validateDSL(dsl)).toThrow();
  });

  test('rejects invalid range', () => {
    const dsl = {
      filter: {
        and: [
          {
            field: 'pe_ratio',
            range: {
              min: 20,
              max: 10  // Invalid: min > max
            }
          }
        ]
      }
    };

    expect(() => validateDSL(dsl)).toThrow();
  });

  test('rejects derived metric without required window', () => {
    const dsl = {
      filter: {
        and: [
          {
            field: 'eps_cagr',
            operator: '>',
            value: 10
            // Missing window
          }
        ]
      }
    };

    expect(() => validateDSL(dsl)).toThrow();
  });
});
