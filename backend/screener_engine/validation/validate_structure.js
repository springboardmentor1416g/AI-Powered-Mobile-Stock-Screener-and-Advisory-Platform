const { DSLValidationError } = require('./validation_errors');

function validateStructure(node) {
  if (!node || typeof node !== 'object') {
    throw new DSLValidationError({
      code: 'INVALID_STRUCTURE',
      message: 'DSL node must be an object'
    });
  }

  if (node.and || node.or) {
    const key = node.and ? 'and' : 'or';

    if (!Array.isArray(node[key]) || node[key].length < 2) {
      throw new DSLValidationError({
        code: 'INVALID_STRUCTURE',
        message: `${key.toUpperCase()} must contain at least 2 conditions`
      });
    }

    node[key].forEach(validateStructure);
    return;
  }

  if (node.not) {
    validateStructure(node.not);
    return;
  }

  // Leaf condition
  if (!node.field) {
    throw new DSLValidationError({
      code: 'INVALID_STRUCTURE',
      message: 'Condition missing field'
    });
  }

  if (!node.operator && !node.range && !node.trend) {
    throw new DSLValidationError({
      code: 'INVALID_STRUCTURE',
      message: `Condition for '${node.field}' has no operator, range, or trend`
    });
  }
}

module.exports = validateStructure;
