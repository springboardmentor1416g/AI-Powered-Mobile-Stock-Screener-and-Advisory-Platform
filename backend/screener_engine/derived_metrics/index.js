const computePEG = require('./peg_ratio');
const computeDebtToFCF = require('./debt_to_fcf');
const computeEPSCAGR = require('./eps_cagr');
const computeRevenueCAGR = require('./revenue_cagr');
const computeFCFMargin = require('./fcf_margin');
const computeEarningsConsistency = require('./earnings_consistency');

module.exports = {
  peg_ratio: {
    compute: computePEG,
    requires: ['pe_ratio', 'eps_growth']
  },

  debt_to_fcf: {
    compute: computeDebtToFCF,
    requires: ['debt', 'free_cash_flow']
  },

  eps_cagr: {
    compute: computeEPSCAGR,
    requires: ['eps_history']
  },

  revenue_cagr: {
    compute: computeRevenueCAGR,
    requires: ['revenue_history']
  },

  fcf_margin: {
    compute: computeFCFMargin,
    requires: ['free_cash_flow', 'revenue']
  },

  earnings_consistency_score: {
    compute: computeEarningsConsistency,
    requires: ['eps_history']
  }
};
