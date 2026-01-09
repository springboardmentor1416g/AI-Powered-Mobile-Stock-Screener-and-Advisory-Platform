const { DerivedMetricError } = require('./errors');

module.exports = function revenueCAGR({ revenue_series }) {
  if (!Array.isArray(revenue_series) || revenue_series.length < 2) {
    throw new DerivedMetricError(
      'REVENUE_CAGR_INVALID',
      'At least 2 revenue values required'
    );
  }

  const start = revenue_series[0];
  const end = revenue_series[revenue_series.length - 1];

  if (start <= 0) {
    throw new DerivedMetricError(
      'REVENUE_CAGR_INVALID',
      'Starting revenue must be positive'
    );
  }

  const n = revenue_series.length - 1;
  return Math.pow(end / start, 1 / n) - 1;
};
