const { DSLValidationError } = require('./validation_errors');

function validateRangeRules(node) {
  if (!node || typeof node !== 'object') return;

  // Logical groups
  if (node.and || node.or) {
    const key = node.and ? 'and' : 'or';
    node[key].forEach(validateRangeRules);
    return;
  }

  if (node.not) {
    validateRangeRules(node.not);
    return;
  }

  // Leaf node with range
  if (node.range) {
    const { min, max, inclusive, exclusive } = node.range;

    if (min === undefined && max === undefined) {
      throw new DSLValidationError({
        code: 'INVALID_RANGE',
        message: `Range for '${node.field}' must define at least min or max`
      });
    }

    if (min !== undefined && max !== undefined && min > max) {
      throw new DSLValidationError({
        code: 'INVALID_RANGE',
        message: `Range for '${node.field}' has min greater than max`
      });
    }

    if (inclusive && exclusive) {
      throw new DSLValidationError({
        code: 'INVALID_RANGE',
        message: `Range for '${node.field}' cannot be both inclusive and exclusive`
      });
    }

    // Numeric safety
    if (
      (min !== undefined && typeof min !== 'number') ||
      (max !== undefined && typeof max !== 'number')
    ) {
      throw new DSLValidationError({
        code: 'INVALID_RANGE',
        message: `Range values for '${node.field}' must be numeric`
      });
    }
  }
}

module.exports = validateRangeRules;
