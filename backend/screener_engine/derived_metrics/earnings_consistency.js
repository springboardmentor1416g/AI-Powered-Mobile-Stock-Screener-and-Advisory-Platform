const { DerivedMetricError } = require('./errors');

module.exports = function earningsConsistency({ eps_series }) {
  if (!Array.isArray(eps_series) || eps_series.length < 2) {
    throw new DerivedMetricError(
      'EARNINGS_CONSISTENCY_INVALID',
      'At least 2 EPS values required'
    );
  }

  // Count positive EPS periods
  const positivePeriods = eps_series.filter(eps => eps > 0).length;
  const totalPeriods = eps_series.length;

  // Return score between 0 and 1
  return positivePeriods / totalPeriods;
};
