const { DSLValidationError } = require('./validation_errors');

function extractConstraints(node, map = {}) {
  if (node.and) {
    node.and.forEach(n => extractConstraints(n, map));
  } else if (node.field && node.operator && typeof node.value === 'number') {
    map[node.field] = map[node.field] || [];
    map[node.field].push({ operator: node.operator, value: node.value });
  }
  return map;
}

function validateLogic(dsl) {
  const constraints = extractConstraints(dsl);

  for (const field in constraints) {
    const rules = constraints[field];

    const min = rules
      .filter(r => r.operator === '>')
      .map(r => r.value);

    const max = rules
      .filter(r => r.operator === '<')
      .map(r => r.value);

    if (min.length && max.length && Math.max(...min) >= Math.min(...max)) {
      throw new DSLValidationError({
        code: 'LOGICAL_CONFLICT',
        field,
        message: `Conflicting constraints on ${field}`
      });
    }
  }
}

module.exports = validateLogic;
