const { DerivedMetricError } = require('./errors');

module.exports = function debtToFCF({ total_debt, free_cash_flow }) {
  if (free_cash_flow === undefined || free_cash_flow <= 0) {
    throw new DerivedMetricError(
      'DEBT_TO_FCF_INVALID',
      'Free cash flow must be greater than zero'
    );
  }

  return total_debt / free_cash_flow;
};
