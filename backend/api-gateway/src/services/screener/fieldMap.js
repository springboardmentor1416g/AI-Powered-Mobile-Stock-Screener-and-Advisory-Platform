// Whitelist mapping: DSL field -> DB column in metrics_normalized
// IMPORTANT: Only put fields that exist in your table.
const FIELD_MAP = {
  pe_ratio: "pe_ratio",
  peg_ratio: "peg_ratio",
  price_to_book: "price_to_book",
  promoter_holding: "promoter_holding",
  net_profit: "net_profit",
  ebitda: "ebitda",
  revenue: "revenue",
  free_cash_flow: "free_cash_flow",
  total_debt: "total_debt",
  debt_to_fcf: "debt_to_fcf",
  roe: "roe",
  revenue_growth_yoy: "revenue_growth_yoy",
  earnings_growth_yoy: "earnings_growth_yoy",
};

const NUMERIC_FIELDS = new Set(Object.keys(FIELD_MAP)); // all numeric for v1

module.exports = { FIELD_MAP, NUMERIC_FIELDS };