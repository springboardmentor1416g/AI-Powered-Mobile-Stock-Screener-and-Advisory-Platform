const { DSLValidationError } = require('./validation_errors');

const ALLOWED_POLICIES = ['fail', 'ignore', 'fallback'];

function validateNullHandling(node) {
  if (!node || typeof node !== 'object') return;

  // Logical groups
  if (node.and || node.or) {
    const key = node.and ? 'and' : 'or';
    node[key].forEach(validateNullHandling);
    return;
  }

  if (node.not) {
    validateNullHandling(node.not);
    return;
  }

  // Leaf condition
  const requiresNullPolicy =
    node.trend ||
    node.range ||
    node.operator ||
    node.field?.includes('growth') ||
    node.field?.includes('cagr') ||
    node.field?.includes('ratio');

  if (requiresNullPolicy) {
    if (!node.on_missing) {
      throw new DSLValidationError({
        code: 'MISSING_NULL_POLICY',
        message: `Missing on_missing policy for '${node.field}'`
      });
    }

    if (!ALLOWED_POLICIES.includes(node.on_missing)) {
      throw new DSLValidationError({
        code: 'INVALID_NULL_POLICY',
        message: `Invalid on_missing policy for '${node.field}'. Allowed: ${ALLOWED_POLICIES.join(', ')}`
      });
    }
  }
}

module.exports = validateNullHandling;
