const { DSLValidationError } = require('./validation_errors');

const SUPPORTED_METRICS = [
  'pe_ratio',
  'revenue',
  'eps',
  'revenue_growth',
  'eps_growth',
  'debt',
  'free_cash_flow'
];

function validateMetrics(node) {
  if (node.and || node.or) {
    (node.and || node.or).forEach(validateMetrics);
    return;
  }

  if (!SUPPORTED_METRICS.includes(node.field)) {
    throw new DSLValidationError({
      code: 'UNSUPPORTED_METRIC',
      field: node.field,
      message: `Metric '${node.field}' is not supported`
    });
  }

  if (node.window) {
    if (!node.window.type || !node.window.length) {
      throw new DSLValidationError({
        code: 'INVALID_WINDOW',
        field: node.field,
        message: 'Window must define type and length'
      });
    }
  }
}

module.exports = validateMetrics;
