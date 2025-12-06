-- ============================================================
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
CREATE TABLE IF NOT EXISTS companies (
    company_id  SERIAL PRIMARY KEY,
    ticker      VARCHAR(10) UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    sector      VARCHAR(50),
    industry    VARCHAR(100),
    exchange    VARCHAR(20),
    market_cap  BIGINT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 2. PRICE HISTORY (REGULAR TABLE IN DEV)
-- ============================================================
CREATE TABLE IF NOT EXISTS price_history (
    time    TIMESTAMP NOT NULL,
    ticker  VARCHAR(10) NOT NULL,
    open    NUMERIC(10,4),
    high    NUMERIC(10,4),
    low     NUMERIC(10,4),
    close   NUMERIC(10,4),
    volume  BIGINT,
    PRIMARY KEY (time, ticker)
);

-- In production, you could later run (once TimescaleDB is installed):
--   CREATE EXTENSION IF NOT EXISTS timescaledb;
--   SELECT create_hypertable('price_history', 'time', if_not_exists => TRUE);
-- and configure chunking/compression policies.

-- ============================================================
-- 3. FUNDAMENTALS TABLES
-- ============================================================

-- Quarterly fundamentals
CREATE TABLE IF NOT EXISTS fundamentals_quarterly (
    id                SERIAL PRIMARY KEY,
    ticker            VARCHAR(10) NOT NULL,
    quarter           VARCHAR(10) NOT NULL,  -- e.g. '2024-Q3'
    revenue           BIGINT,
    net_income        BIGINT,
    eps               NUMERIC(10,4),
    operating_margin  NUMERIC(10,4),
    roe               NUMERIC(10,4),
    roa               NUMERIC(10,4),
    pe_ratio          NUMERIC(10,4),
    pb_ratio          NUMERIC(10,4),
    created_at        TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- Annual fundamentals
CREATE TABLE IF NOT EXISTS fundamentals_annual (
    id                SERIAL PRIMARY KEY,
    ticker            VARCHAR(10) NOT NULL,
    year              INTEGER NOT NULL,
    revenue           BIGINT,
    net_income        BIGINT,
    eps               NUMERIC(10,4),
    operating_margin  NUMERIC(10,4),
    roe               NUMERIC(10,4),
    roa               NUMERIC(10,4),
    pe_ratio          NUMERIC(10,4),
    pb_ratio          NUMERIC(10,4),
    created_at        TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- ============================================================
-- 4. ANALYST ESTIMATES
-- ============================================================
CREATE TABLE IF NOT EXISTS analyst_estimates (
    id                SERIAL PRIMARY KEY,
    ticker            VARCHAR(10) NOT NULL,
    estimate_date     DATE NOT NULL,
    eps_estimate      NUMERIC(10,4),
    revenue_estimate  BIGINT,
    price_target_low  NUMERIC(10,4),
    price_target_avg  NUMERIC(10,4),
    price_target_high NUMERIC(10,4),
    analyst_rating    VARCHAR(32),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- ============================================================
-- 5. BUYBACKS
-- ============================================================
CREATE TABLE IF NOT EXISTS buybacks (
    id                SERIAL PRIMARY KEY,
    ticker            VARCHAR(10) NOT NULL,
    announcement_date DATE NOT NULL,
    amount            BIGINT,
    remarks           TEXT,
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- ============================================================
-- 6. CASHFLOW STATEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS cashflow_statements (
    id       SERIAL PRIMARY KEY,
    ticker   VARCHAR(10) NOT NULL,
    period   VARCHAR(10) NOT NULL,  -- e.g. '2024-Q1'
    cfo      BIGINT,                -- cash flow from operations
    cfi      BIGINT,                -- cash flow from investing
    cff      BIGINT,                -- cash flow from financing
    capex    BIGINT,
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- ============================================================
-- 7. DEBT PROFILE
-- ============================================================
CREATE TABLE IF NOT EXISTS debt_profile (
    id              SERIAL PRIMARY KEY,
    ticker          VARCHAR(10) NOT NULL,
    quarter         VARCHAR(10) NOT NULL,
    short_term_debt BIGINT,
    long_term_debt  BIGINT,
    debt_to_equity  NUMERIC(10,4),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- ============================================================
-- 8. INSIDER TRADES
-- ============================================================
CREATE TABLE IF NOT EXISTS insider_trades (
    id               SERIAL PRIMARY KEY,
    ticker           VARCHAR(10) NOT NULL,
    trade_date       DATE NOT NULL,
    insider_name     VARCHAR(100),
    transaction_type VARCHAR(20), -- 'BUY' / 'SELL'
    shares           BIGINT,
    price            NUMERIC(10,4),
    value            NUMERIC(15,4),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Companies
CREATE INDEX IF NOT EXISTS idx_companies_ticker      ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_sector      ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_industry    ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_market_cap  ON companies(market_cap);

-- Price History
CREATE INDEX IF NOT EXISTS idx_price_history_ticker_time
    ON price_history(ticker, time DESC);

-- Fundamentals
CREATE INDEX IF NOT EXISTS idx_fundamentals_q_ticker
    ON fundamentals_quarterly(ticker);
CREATE INDEX IF NOT EXISTS idx_fundamentals_q_quarter
    ON fundamentals_quarterly(quarter);

CREATE INDEX IF NOT EXISTS idx_fundamentals_a_ticker
    ON fundamentals_annual(ticker);
CREATE INDEX IF NOT EXISTS idx_fundamentals_a_year
    ON fundamentals_annual(year);

-- Analyst Estimates
CREATE INDEX IF NOT EXISTS idx_analyst_ticker_date
    ON analyst_estimates(ticker, estimate_date DESC);

-- Composite index for screener queries
CREATE INDEX IF NOT EXISTS idx_screener_fundamentals
    ON fundamentals_quarterly(ticker, pe_ratio, roe, operating_margin);

-- Time-series helper index
CREATE INDEX IF NOT EXISTS idx_time_series_queries
    ON price_history(time, ticker, close);
