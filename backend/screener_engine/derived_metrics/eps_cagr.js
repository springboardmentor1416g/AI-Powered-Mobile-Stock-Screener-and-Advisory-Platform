const { DerivedMetricError } = require('./errors');

module.exports = function epsCAGR({ eps_series }) {
  if (!Array.isArray(eps_series) || eps_series.length < 2) {
    throw new DerivedMetricError(
      'EPS_CAGR_INVALID',
      'At least 2 EPS values required'
    );
  }

  const start = eps_series[0];
  const end = eps_series[eps_series.length - 1];

  if (start <= 0) {
    throw new DerivedMetricError(
      'EPS_CAGR_INVALID',
      'Starting EPS must be positive'
    );
  }

  const n = eps_series.length - 1;
  return Math.pow(end / start, 1 / n) - 1;
};
