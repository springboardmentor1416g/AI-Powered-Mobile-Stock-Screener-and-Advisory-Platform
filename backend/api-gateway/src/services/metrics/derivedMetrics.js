const { safeDivide } = require("./safety");

function computeDerivedMetrics(row) {
  return {
    peg_ratio: safeDivide(row.pe, row.eps_growth, "PEG"),
    debt_to_fcf: safeDivide(row.debt, row.free_cash_flow, "Debt/FCF"),
    fcf_margin: safeDivide(row.free_cash_flow, row.revenue, "FCF Margin")
  };
}

module.exports = { computeDerivedMetrics };
