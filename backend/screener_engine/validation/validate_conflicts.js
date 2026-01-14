const { DSLValidationError } = require('./validation_errors');

function validateConflicts(node, constraints = {}) {
  if (!node) return;

  // Handle AND / OR
  if (node.and || node.or) {
    const group = node.and || node.or;

    group.forEach(condition => {
      validateConflicts(condition, constraints);
    });
    return;
  }

  // Ignore NOT for now (future scope)
  if (node.not) {
    validateConflicts(node.not, constraints);
    return;
  }

  // Leaf condition
  const { field, operator, value } = node;

  if (!constraints[field]) {
    constraints[field] = {};
  }

  const c = constraints[field];

  if (operator === '<') {
    if (c.min !== undefined && value <= c.min) {
      throw new DSLValidationError({
        code: 'CONFLICTING_RULES',
        message: `Unsatisfiable condition: ${field} < ${value} conflicts with ${field} > ${c.min}`
      });
    }
    c.max = Math.min(c.max ?? Infinity, value);
  }

  if (operator === '>') {
    if (c.max !== undefined && value >= c.max) {
      throw new DSLValidationError({
        code: 'CONFLICTING_RULES',
        message: `Unsatisfiable condition: ${field} > ${value} conflicts with ${field} < ${c.max}`
      });
    }
    c.min = Math.max(c.min ?? -Infinity, value);
  }
}

module.exports = validateConflicts;
