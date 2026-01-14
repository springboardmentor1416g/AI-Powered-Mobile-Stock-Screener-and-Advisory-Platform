const { DerivedMetricError } = require('./errors');

module.exports = function fcfMargin({ free_cash_flow, revenue }) {
  if (revenue === undefined || revenue <= 0) {
    throw new DerivedMetricError(
      'FCF_MARGIN_INVALID',
      'Revenue must be greater than zero'
    );
  }

  if (free_cash_flow === undefined) {
    throw new DerivedMetricError(
      'FCF_MARGIN_INVALID',
      'Free cash flow is required'
    );
  }

  return (free_cash_flow / revenue) * 100; // Return as percentage
};
