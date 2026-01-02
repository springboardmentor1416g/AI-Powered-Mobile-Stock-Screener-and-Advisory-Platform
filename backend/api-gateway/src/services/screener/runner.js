const { compileDSL } = require("./compiler");

// Uses "latest annual" row per ticker from metrics_normalized.
// Assumes period_label sorts descending (e.g., 2025 > 2024).
async function runScreener({ pool, dsl, limit = 200 }) {
  const { where, params } = compileDSL(dsl);

  // Add limit as last param
  params.push(limit);
  const limitParam = `$${params.length}`;

  const sql = `
WITH latest AS (
  SELECT DISTINCT ON (m.ticker)
    m.ticker,
    m.period_type,
    m.period_label,
    m.revenue,
    m.ebitda,
    m.free_cash_flow,
    m.pe_ratio,
    m.peg_ratio,
    m.debt_to_fcf,
    m.price_to_book,
    m.promoter_holding,
    m.net_profit,
    m.roe,
    m.total_debt,
    m.revenue_growth_yoy,
    m.earnings_growth_yoy
  FROM metrics_normalized m
  WHERE m.period_type = 'annual'
  ORDER BY m.ticker, m.period_label DESC
)
SELECT
  c.ticker AS symbol,
  c.name,
  c.sector,
  c.exchange,
  l.period_label,
  l.pe_ratio,
  l.peg_ratio,
  l.debt_to_fcf,
  l.revenue,
  l.ebitda,
  l.free_cash_flow
FROM latest l
JOIN companies c ON c.ticker = l.ticker
WHERE ${where}
ORDER BY c.ticker
LIMIT ${limitParam};
`;

  const result = await pool.query(sql, params);
  return result.rows;
}

module.exports = { runScreener };
