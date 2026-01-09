const { DSLValidationError } = require('./validation_errors');

const DERIVED_METRICS = {
  peg_ratio: { denominator: 'eps_growth' },
  debt_to_fcf: { denominator: 'free_cash_flow' }
};

function validateDerivedMetrics(node) {
  if (node.and || node.or) {
    (node.and || node.or).forEach(validateDerivedMetrics);
    return;
  }

  if (DERIVED_METRICS[node.field]) {
    throw new DSLValidationError({
      code: 'UNSAFE_DERIVED_METRIC',
      field: node.field,
      message: `Derived metric '${node.field}' requires denominator safety checks`
    });
  }
}

module.exports = validateDerivedMetrics;
