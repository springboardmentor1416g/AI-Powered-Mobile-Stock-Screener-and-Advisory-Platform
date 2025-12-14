-- Check missing quarters
SELECT ticker, COUNT(*) AS quarter_count
FROM fundamentals_quarterly
GROUP BY ticker
HAVING COUNT(*) < 4;

-- Year-over-Year revenue growth
SELECT
  f1.ticker,
  f1.fiscal_year,
  (f1.revenue - f2.revenue) / f2.revenue AS revenue_growth_yoy
FROM fundamentals_annual f1
JOIN fundamentals_annual f2
  ON f1.ticker = f2.ticker
 AND f1.fiscal_year = f2.fiscal_year + 1;

-- Debt to Free Cash Flow
SELECT
  ticker,
  fiscal_year,
  total_debt / NULLIF(free_cash_flow, 0) AS debt_to_fcf
FROM fundamentals_annual;
