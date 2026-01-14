module.exports = {
  // Base metrics
  pe_ratio: 'financials.pe_ratio',
  revenue: 'financials.revenue',
  eps: 'financials.eps',
  net_profit: 'financials.net_profit',
  ebitda: 'financials.ebitda',
  roe: 'financials.roe',
  total_debt: 'financials.total_debt',
  free_cash_flow: 'financials.free_cash_flow',
  // Growth metrics
  revenue_growth: 'financials.revenue_growth',
  revenue_growth_yoy: 'financials.revenue_growth_yoy',
  eps_growth: 'financials.eps_growth',
  earnings_growth_yoy: 'financials.earnings_growth_yoy',
  // Derived metrics (computed at runtime, but included for reference)
  peg_ratio: null, // Computed dynamically
  debt_to_fcf: null, // Computed dynamically
  eps_cagr: null, // Computed dynamically
  revenue_cagr: null, // Computed dynamically
  fcf_margin: null, // Computed dynamically
  earnings_consistency_score: null, // Computed dynamically
  // Other fields
  promoter_holding: 'ownership.promoter_holding'
};
