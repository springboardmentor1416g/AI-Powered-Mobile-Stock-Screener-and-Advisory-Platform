const { DSLValidationError } = require('./validation_errors');

const ALLOWED_UNITS = ['quarter', 'year'];

function validateTemporalRules(node) {
  if (!node || typeof node !== 'object') return;

  // Logical groups
  if (node.and || node.or) {
    const group = node.and || node.or;
    group.forEach(validateTemporalRules);
    return;
  }

  // NOT operator
  if (node.not) {
    validateTemporalRules(node.not);
    return;
  }

  // Leaf condition
  const { trend, period, field } = node;

  // ---- Trend requires period ----
  if (trend) {
    if (!period) {
      throw new DSLValidationError({
        code: 'TEMPORAL_PERIOD_MISSING',
        message: `Trend condition for '${field}' requires a time window`
      });
    }
  }

  // ---- Validate period if present ----
  if (period) {
    if (typeof period !== 'object') {
      throw new DSLValidationError({
        code: 'INVALID_TEMPORAL_PERIOD',
        message: `Invalid period definition for '${field}'`
      });
    }

    const { unit, last } = period;

    if (!ALLOWED_UNITS.includes(unit)) {
      throw new DSLValidationError({
        code: 'INVALID_TEMPORAL_UNIT',
        message: `Unsupported time unit '${unit}' for '${field}'`
      });
    }

    if (!Number.isInteger(last) || last <= 0) {
      throw new DSLValidationError({
        code: 'INVALID_TEMPORAL_WINDOW',
        message: `Time window for '${field}' must be a positive integer`
      });
    }
  }
}

module.exports = validateTemporalRules;
