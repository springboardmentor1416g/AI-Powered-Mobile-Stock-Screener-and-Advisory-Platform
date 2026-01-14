/**
 * Mock NL → DSL translator
 * Compiler v1 supports ONLY AND
 */

function translateNLToDSL(query) {
  const q = query.toLowerCase();

  // Always emit AND
  const conditions = [];

  if (q.includes('pe') && q.includes('less than')) {
    conditions.push({
      field: 'pe_ratio',
      operator: '<',
      value: 30
    });
  }

  if (q.includes('revenue')) {
    conditions.push({
      field: 'revenue_growth_yoy',
      operator: '>',
      value: 10
    });
  }

  if (conditions.length === 0) {
    throw new Error('Unsupported query format');
  }

  // IMPORTANT: even single condition must be AND-wrapped
  return {
    and: conditions
  };
}

module.exports = translateNLToDSL;
