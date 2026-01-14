const { DSLValidationError } = require('./validation_errors');

function validateStructure(node) {
  if (!node || typeof node !== 'object') {
    throw new DSLValidationError({
      code: 'INVALID_STRUCTURE',
      message: 'DSL node must be an object'
    });
  }

  /* ---------- Logical nodes ---------- */
  if (node.and || node.or) {
    const key = node.and ? 'and' : 'or';

    if (!Array.isArray(node[key]) || node[key].length < 1) {
      throw new DSLValidationError({
        code: 'INVALID_STRUCTURE',
        message: `${key.toUpperCase()} must contain at least one condition`
      });
    }

    node[key].forEach(validateStructure);
    return;
  }

  if (node.not) {
    validateStructure(node.not);
    return;
  }

  /* ---------- Leaf condition ---------- */
  if (!node.field) {
    throw new DSLValidationError({
      code: 'INVALID_STRUCTURE',
      message: 'Condition missing field'
    });
  }

  /* Operator condition */
  if (node.operator) {
    if (node.value === undefined) {
      throw new DSLValidationError({
        code: 'INVALID_STRUCTURE',
        message: `Operator condition for '${node.field}' missing value`
      });
    }
    return;
  }

  /* Range condition */
  if (node.range) {
    const { min, max } = node.range;
    if (min === undefined || max === undefined) {
      throw new DSLValidationError({
        code: 'INVALID_STRUCTURE',
        message: `Range condition for '${node.field}' must define min and max`
      });
    }
    return;
  }

  /* Trend / temporal condition (placeholder for M3) */
  if (node.trend) {
    return;
  }

  throw new DSLValidationError({
    code: 'INVALID_STRUCTURE',
    message: `Condition for '${node.field}' has no operator, range, or trend`
  });
}

module.exports = validateStructure;
