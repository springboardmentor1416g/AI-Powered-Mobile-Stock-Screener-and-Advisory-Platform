 ============================================================
-- Database: stock_screener
-- Core schema for AI-Powered Mobile Stock Screener & Advisory Platform
-- Local dev: plain PostgreSQL (no TimescaleDB extension required)
-- ============================================================

-- NOTE:
-- For production, TimescaleDB can be enabled on the server and
-- price_history converted to a hypertable. For local dev, we keep it
-- as a normal table to avoid extension installation issues.

-- ============================================================
-- 1. COMPANIES TABLE
-- ============================================================
-- /backend/database/schema.sql
-- Run as a superuser for extension creation then as a db owner for tables.

-- 1. DB + extension (run once)
CREATE DATABASE stock_screener;
\c stock_screener;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 2. companies
CREATE TABLE IF NOT EXISTS companies (
  company_id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) UNIQUE NOT NULL,
  name TEXT,
  sector VARCHAR(50),
  industry VARCHAR(100),
  exchange VARCHAR(20),
  market_cap BIGINT,
  ipo_date DATE,
  country VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. price_history (hypertable)
CREATE TABLE IF NOT EXISTS price_history (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  ticker VARCHAR(10) NOT NULL,
  open NUMERIC,
  high NUMERIC,
  low NUMERIC,
  close NUMERIC,
  volume BIGINT,
  adj_close NUMERIC,
  PRIMARY KEY (time, ticker)
);

SELECT create_hypertable('price_history','time', if_not_exists => TRUE, chunk_time_interval => interval '7 days');

-- 4. fundamentals_quarterly
CREATE TABLE IF NOT EXISTS fundamentals_quarterly (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  fiscal_year INT,
  quarter VARCHAR(10),
  period_start DATE,
  period_end DATE,
  revenue BIGINT,
  gross_profit BIGINT,
  operating_income BIGINT,
  net_income BIGINT,
  eps NUMERIC,
  operating_margin NUMERIC,
  roe NUMERIC,
  roa NUMERIC,
  pe_ratio NUMERIC,
  pb_ratio NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. fundamentals_annual
CREATE TABLE IF NOT EXISTS fundamentals_annual (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  fiscal_year INT,
  revenue BIGINT,
  net_income BIGINT,
  eps NUMERIC,
  operating_margin NUMERIC,
  roe NUMERIC,
  roa NUMERIC,
  pe_ratio NUMERIC,
  pb_ratio NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. analyst_estimates
CREATE TABLE IF NOT EXISTS analyst_estimates (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10),
  estimate_date DATE,
  provider VARCHAR(100),
  eps_estimate NUMERIC,
  revenue_estimate BIGINT,
  price_target_low NUMERIC,
  price_target_avg NUMERIC,
  price_target_high NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. buybacks
CREATE TABLE IF NOT EXISTS buybacks (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10),
  announcement_date DATE,
  amount BIGINT,
  currency VARCHAR(10),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. cashflow_statements
CREATE TABLE IF NOT EXISTS cashflow_statements (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10),
  period VARCHAR(10),
  period_end DATE,
  cfo BIGINT,
  cfi BIGINT,
  cff BIGINT,
  capex BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. debt_profile
CREATE TABLE IF NOT EXISTS debt_profile (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10),
  quarter VARCHAR(10),
  as_of DATE,
  short_term_debt BIGINT,
  long_term_debt BIGINT,
  total_debt BIGINT,
  debt_to_equity NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. insider_trades
CREATE TABLE IF NOT EXISTS insider_trades (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10),
  insider_name TEXT,
  relation TEXT,
  trade_date DATE,
  trade_type VARCHAR(10), -- buy/sell
  shares BIGINT,
  price NUMERIC,
  value NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_history_ticker_time ON price_history (ticker, time DESC);
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies (ticker);
CREATE INDEX IF NOT EXISTS idx_fund_quarter_ticker ON fundamentals_quarterly (ticker, fiscal_year, quarter);
CREATE INDEX IF NOT EXISTS idx_estimates_ticker_date ON analyst_estimates (ticker, estimate_date);
CREATE INDEX IF NOT EXISTS idx_buybacks_ticker_date ON buybacks (ticker, announcement_date);
CREATE INDEX IF NOT EXISTS idx_debt_ticker_asof ON debt_profile (ticker, as_of);

-- 12. sample materialized view for daily aggregates (refresh via cron)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_ohlc AS
SELECT
  time::date AS day,
  ticker,
  first(open, time) AS open,
  max(high) AS high,
  min(low) AS low,
  last(close, time) AS close,
  sum(volume) AS volume
FROM price_history
GROUP BY day, ticker;

-- 13. grants (example)
CREATE ROLE app_readonly NOLOGIN;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;

    