-- Prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS uq_fund_q ON fundamentals_quarterly (ticker, quarter);
CREATE UNIQUE INDEX IF NOT EXISTS uq_fund_a ON fundamentals_annual (ticker, year);

-- If metrics_normalized is per ticker+period_type+period_label:
CREATE UNIQUE INDEX IF NOT EXISTS uq_metrics_norm
ON metrics_normalized (ticker, period_type, period_label);
