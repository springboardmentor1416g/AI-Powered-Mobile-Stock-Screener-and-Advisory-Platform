/**
 * Mock NL → DSL translator
 * Deterministic stub (NO real LLM)
 */

function translateNLToDSL(query) {
  const q = query.toLowerCase();

  // Simple hard-coded patterns
  if (q.includes('pe') && q.includes('less than')) {
    return {
      and: [
        {
          field: 'pe_ratio',
          operator: '<',
          value: 30
        }
      ]
    };
  }

  if (q.includes('pe') && q.includes('revenue')) {
    return {
      and: [
        {
          field: 'pe_ratio',
          operator: '<',
          value: 30
        },
        {
          field: 'revenue_growth_yoy',
          operator: '>',
          value: 10
        }
      ]
    };
  }

  // Unsupported query
  throw new Error('Unsupported query format');
}

module.exports = translateNLToDSL;
