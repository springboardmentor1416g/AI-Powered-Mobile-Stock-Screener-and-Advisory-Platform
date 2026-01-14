const { DSLValidationError } = require('./validation_errors');

const DERIVED_METRICS = {
  peg_ratio: {
    requires: ['pe_ratio', 'eps_growth'],
    requiresWindow: false
  },
  debt_to_fcf: {
    requires: ['debt', 'free_cash_flow'],
    requiresWindow: false
  },
  eps_cagr: {
    requires: ['eps'],
    requiresWindow: true
  },
  revenue_cagr: {
    requires: ['revenue'],
    requiresWindow: true
  },
  fcf_margin: {
    requires: ['free_cash_flow', 'revenue'],
    requiresWindow: false
  },
  earnings_consistency_score: {
    requires: ['eps'],
    requiresWindow: true
  }
};

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

  const metricDef = DERIVED_METRICS[node.field];
  if (!metricDef) return; // Not a derived metric, skip

  // Validate that CAGR metrics require a time window
  if (metricDef.requiresWindow && !node.window) {
    throw new DSLValidationError({
      code: 'DERIVED_METRIC_MISSING_WINDOW',
      message: `Derived metric '${node.field}' requires a time window`,
      field: node.field
    });
  }

  // Note: Actual divide-by-zero and safety checks happen at runtime
  // during metric computation, not during DSL validation
}

module.exports = validateDerivedMetrics;
