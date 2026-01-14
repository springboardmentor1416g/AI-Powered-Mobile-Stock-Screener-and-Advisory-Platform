const { DSLValidationError } = require('./validation_errors');

function validateDerivedMetrics(node) {
  if (!node || typeof node !== 'object') return;

  // Handle logical groups
  if (node.and || node.or) {
    const key = node.and ? 'and' : 'or';
    node[key].forEach(validateDerivedMetrics);
    return;
  }

  // Only validate leaf conditions
  if (!node.field) return;

  // PEG ratio validation
  if (node.field === 'peg_ratio') {
    if (
      node.eps_growth === undefined ||
      typeof node.eps_growth !== 'number' ||
      node.eps_growth <= 0
    ) {
      throw new DSLValidationError({
        code: 'DERIVED_METRIC_MISSING_INPUT',
        message: 'PEG ratio requires positive eps_growth input',
        field: 'eps_growth'
      });
    }
  }

  // Add future derived metrics here (Debt/FCF, CAGR, etc.)
}

module.exports = validateDerivedMetrics;
