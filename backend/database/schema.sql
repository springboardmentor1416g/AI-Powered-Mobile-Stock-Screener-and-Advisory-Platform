-- Create database
CREATE DATABASE stock_screener;

-- Connect to the new database
\c stock_screener

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ========== COMPANIES TABLE ==========
CREATE TABLE companies (
    company_id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sector VARCHAR(50),
    industry VARCHAR(100),
    exchange VARCHAR(20),
    market_cap BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ========== PRICE HISTORY (HYPERTABLE) ==========
CREATE TABLE price_history (
    time TIMESTAMP NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    open NUMERIC(10,4),
    high NUMERIC(10,4),
    low NUMERIC(10,4),
    close NUMERIC(10,4),
    volume BIGINT,
    PRIMARY KEY (time, ticker)
);

SELECT create_hypertable('price_history', 'time');

-- ========== FUNDAMENTALS TABLES ==========
CREATE TABLE fundamentals_quarterly (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    quarter VARCHAR(10) NOT NULL,
    revenue BIGINT,
    net_income BIGINT,
    eps NUMERIC(10,4),
    operating_margin NUMERIC(10,4),
    roe NUMERIC(10,4),
    roa NUMERIC(10,4),
    pe_ratio NUMERIC(10,4),
    pb_ratio NUMERIC(10,4),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

CREATE TABLE fundamentals_annual (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    year INTEGER NOT NULL,
    revenue BIGINT,
    net_income BIGINT,
    eps NUMERIC(10,4),
    operating_margin NUMERIC(10,4),
    roe NUMERIC(10,4),
    roa NUMERIC(10,4),
    pe_ratio NUMERIC(10,4),
    pb_ratio NUMERIC(10,4),
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- ========== ANALYST ESTIMATES ==========
CREATE TABLE analyst_estimates (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    estimate_date DATE NOT NULL,
    eps_estimate NUMERIC(10,4),
    revenue_estimate BIGINT,
    price_target_low NUMERIC(10,4),
    price_target_avg NUMERIC(10,4),
    price_target_high NUMERIC(10,4),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- ========== BUYBACKS ==========
CREATE TABLE buybacks (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    announcement_date DATE NOT NULL,
    amount BIGINT,
    remarks TEXT,
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- ========== CASHFLOW STATEMENTS ==========
CREATE TABLE cashflow_statements (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    period VARCHAR(10) NOT NULL,
    cfo BIGINT,
    cfi BIGINT,
    cff BIGINT,
    capex BIGINT,
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- ========== DEBT PROFILE ==========
CREATE TABLE debt_profile (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    quarter VARCHAR(10) NOT NULL,
    short_term_debt BIGINT,
    long_term_debt BIGINT,
    debt_to_equity NUMERIC(10,4),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- ========== INSIDER TRADES ==========
CREATE TABLE insider_trades (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    trade_date DATE NOT NULL,
    insider_name VARCHAR(100),
    transaction_type VARCHAR(20),
    shares BIGINT,
    price NUMERIC(10,4),
    value NUMERIC(15,4),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- Add performance indexes (append to schema.sql)
-- Companies table
CREATE INDEX idx_companies_ticker ON companies(ticker);
CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_market_cap ON companies(market_cap);

-- Price History (Hypertable already optimized)
CREATE INDEX idx_price_history_ticker_time ON price_history(ticker, time DESC);

-- Fundamentals
CREATE INDEX idx_fundamentals_q_ticker ON fundamentals_quarterly(ticker);
CREATE INDEX idx_fundamentals_q_quarter ON fundamentals_quarterly(quarter);
CREATE INDEX idx_fundamentals_a_ticker ON fundamentals_annual(ticker);
CREATE INDEX idx_fundamentals_a_year ON fundamentals_annual(year);

-- Analyst Estimates
CREATE INDEX idx_analyst_ticker_date ON analyst_estimates(ticker, estimate_date DESC);

-- Composite indexes for screener queries
CREATE INDEX idx_screener_fundamentals ON fundamentals_quarterly(
    ticker, pe_ratio, roe, operating_margin
);

-- Index for time-series queries
CREATE INDEX idx_time_series_queries ON price_history(time, ticker, close);






-- Configure chunk size for price_history (7 days per chunk)
SELECT set_chunk_time_interval('price_history', INTERVAL '7 days');

-- Enable compression for older data
ALTER TABLE price_history SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'ticker'
);

-- Add compression policy
SELECT add_compression_policy('price_history', INTERVAL '30 days');





-- Example: Find companies with PE < 20 and ROE > 15%
SELECT c.ticker, c.name, f.pe_ratio, f.roe
FROM companies c
JOIN (
    SELECT DISTINCT ON (ticker) *
    FROM fundamentals_quarterly
    ORDER BY ticker, quarter DESC
) f ON c.ticker = f.ticker
WHERE f.pe_ratio < 20 
  AND f.roe > 0.15
ORDER BY f.pe_ratio ASC;

-- Daily aggregation with TimescaleDB functions
SELECT 
    time_bucket('1 day', time) as day,
    ticker,
    AVG(close) as avg_close,
    SUM(volume) as total_volume
FROM price_history
WHERE time > NOW() - INTERVAL '30 days'
GROUP BY day, ticker
ORDER BY day DESC;




-- Monitor hypertable performance
SELECT * FROM timescaledb_information.hypertables;
SELECT * FROM timescaledb_information.chunks;

-- Vacuum and analyze regularly
VACUUM ANALYZE price_history;
VACUUM ANALYZE companies;

-- Check index usage
SELECT * FROM pg_stat_user_indexes;