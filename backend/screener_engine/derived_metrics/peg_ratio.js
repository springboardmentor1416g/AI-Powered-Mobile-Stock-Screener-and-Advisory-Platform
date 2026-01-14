const { DerivedMetricError } = require('./errors');

module.exports = function pegRatio({ pe_ratio, eps_growth }) {
  if (pe_ratio === null || pe_ratio === undefined) {
    throw new DerivedMetricError(
      'PEG_RATIO_INVALID',
      'PE ratio is required but not available'
    );
  }
  
  if (eps_growth === undefined || eps_growth <= 0) {
    throw new DerivedMetricError(
      'PEG_RATIO_INVALID',
      'EPS growth must be greater than zero'
    );
  }

  return pe_ratio / eps_growth;
};
