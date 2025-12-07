-- V1__init_schema.sql
-- Initial migration for AI-Powered Stock Screener Database
-- Contains core tables and hypertable creation (TimescaleDB)

CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

----------------------------------------------
-- 1. Companies table
----------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
    company_id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(150),
    exchange VARCHAR(20),
    market_cap BIGINT,
    listing_date DATE,
    isin VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

----------------------------------------------
-- 2. Price History (TimescaleDB Hypertable)
----------------------------------------------
CREATE TABLE IF NOT EXISTS price_history (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC,
    volume BIGINT,
    adj_close NUMERIC,
    PRIMARY KEY (time, ticker)
);

SELECT create_hypertable('price_history', 'time', if_not_exists => true);

----------------------------------------------
-- 3. Fundamentals - Quarterly
----------------------------------------------
CREATE TABLE IF NOT EXISTS fundamentals_quarterly (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    quarter VARCHAR(10),
    revenue BIGINT,
    gross_profit BIGINT,
    operating_income BIGINT,
    net_income BIGINT,
    eps NUMERIC,
    ebitda BIGINT,
    operating_margin NUMERIC,
    roe NUMERIC,
    roa NUMERIC,
    pe_ratio NUMERIC,
    pb_ratio NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

----------------------------------------------
-- 4. Fundamentals - Annual
----------------------------------------------
CREATE TABLE IF NOT EXISTS fundamentals_annual (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    revenue BIGINT,
    gross_profit BIGINT,
    operating_income BIGINT,
    net_income BIGINT,
    eps NUMERIC,
    ebitda BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

----------------------------------------------
-- 5. Analyst Estimates
----------------------------------------------
CREATE TABLE IF NOT EXISTS analyst_estimates (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    provider VARCHAR(100),
    estimate_date DATE,
    eps_estimate NUMERIC,
    revenue_estimate BIGINT,
    price_target_low NUMERIC,
    price_target_avg NUMERIC,
    price_target_high NUMERIC,
    rating TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

----------------------------------------------
-- 6. Buybacks
----------------------------------------------
CREATE TABLE IF NOT EXISTS buybacks (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    announcement_date DATE,
    effective_date DATE,
    amount BIGINT,
    shares BIGINT,
    remarks TEXT,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

----------------------------------------------
-- 7. Cashflow Statements
----------------------------------------------
CREATE TABLE IF NOT EXISTS cashflow_statements (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    period_start DATE,
    period_end DATE,
    period_label VARCHAR(20),
    cfo BIGINT,
    cfi BIGINT,
    cff BIGINT,
    capex BIGINT,
    free_cash_flow BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

----------------------------------------------
-- 8. Debt Profile
----------------------------------------------
CREATE TABLE IF NOT EXISTS debt_profile (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    period_start DATE,
    period_end DATE,
    quarter VARCHAR(10),
    short_term_debt BIGINT,
    long_term_debt BIGINT,
    total_debt BIGINT,
    debt_to_equity NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

----------------------------------------------
-- 9. Insider Trades
----------------------------------------------
CREATE TABLE IF NOT EXISTS insider_trades (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    trade_date DATE,
    insider_name TEXT,
    relation TEXT,
    trade_type TEXT,
    quantity BIGINT,
    price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

----------------------------------------------
-- 10. Earnings Calendar
----------------------------------------------
CREATE TABLE IF NOT EXISTS earnings_calendar (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    next_earnings_date DATE,
    last_earnings_date DATE,
    last_eps NUMERIC,
    eps_surprise NUMERIC,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

----------------------------------------------
-- 11. Indexes
----------------------------------------------
CREATE INDEX IF NOT EXISTS idx_price_history_ticker_time_desc ON price_history (ticker, time DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_time ON price_history (time);

CREATE INDEX IF NOT EXISTS idx_fund_q_ticker_period ON fundamentals_quarterly (ticker, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_fund_a_ticker_year ON fundamentals_annual (ticker, year DESC);

CREATE INDEX IF NOT EXISTS idx_analyst_estimates_ticker_date ON analyst_estimates (ticker, estimate_date DESC);

CREATE INDEX IF NOT EXISTS idx_buybacks_ticker_date ON buybacks (ticker, announcement_date DESC);

CREATE INDEX IF NOT EXISTS idx_cashflow_ticker_period ON cashflow_statements (ticker, period_end DESC);

CREATE INDEX IF NOT EXISTS idx_debt_profile_ticker_period ON debt_profile (ticker, period_end DESC);

CREATE INDEX IF NOT EXISTS idx_earnings_calendar_ticker_date ON earnings_calendar (ticker, next_earnings_date);

-- End of migration
