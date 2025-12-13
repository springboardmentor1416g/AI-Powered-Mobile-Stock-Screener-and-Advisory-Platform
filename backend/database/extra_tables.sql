-- Annual fundamentals table
CREATE TABLE IF NOT EXISTS fundamentals_annual (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10),
  fiscal_year VARCHAR(10),
  revenue BIGINT,
  gross_profit BIGINT,
  operating_income BIGINT,
  net_income BIGINT,
  eps NUMERIC,
  total_assets BIGINT,
  total_liabilities BIGINT,
  cash_and_equivalents BIGINT,
  free_cash_flow BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Derived metrics / normalized metrics
CREATE TABLE IF NOT EXISTS metrics_normalized (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10),
  period VARCHAR(20), -- e.g., 2023-Q1 or 2022 (annual)
  metric_name VARCHAR(64),
  metric_value NUMERIC,
  metric_unit VARCHAR(16), -- e.g., INR, USD, ratio
  source VARCHAR(128),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Optional: ownership table schema (simple)
CREATE TABLE IF NOT EXISTS ownership (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10),
  period VARCHAR(20),
  promoter_holding_percent NUMERIC,
  institutional_holding_percent NUMERIC,
  retail_holding_percent NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);
