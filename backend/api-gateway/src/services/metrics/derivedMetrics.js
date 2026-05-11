const { safeDivide } = require("./safety");

function computeDerivedMetrics(row) {
  const pegNumerator = row.pe_ratio ?? row.pe;
  const pegDenominator = row.earnings_growth_yoy ?? row.eps_growth;
  const debtNumerator = row.debt_to_fcf ?? row.total_debt ?? row.debt;

  return {
    peg_ratio:
      pegNumerator != null && pegDenominator != null && pegDenominator !== 0
        ? safeDivide(pegNumerator, pegDenominator, "PEG")
        : null,
    debt_to_fcf:
      row.debt_to_fcf != null
        ? row.debt_to_fcf
        : debtNumerator != null && row.free_cash_flow != null && row.free_cash_flow !== 0
        ? safeDivide(debtNumerator, row.free_cash_flow, "Debt/FCF")
        : null,
    fcf_margin:
      row.free_cash_flow != null && row.revenue != null && row.revenue !== 0
        ? safeDivide(row.free_cash_flow, row.revenue, "FCF Margin")
        : null
  };
}

module.exports = { computeDerivedMetrics };