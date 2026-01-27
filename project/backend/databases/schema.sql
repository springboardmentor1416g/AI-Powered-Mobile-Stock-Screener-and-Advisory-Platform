-- ============================================
-- STOCK SCREENER PLATFORM - PRODUCTION SCHEMA
-- PostgreSQL 16+ Compatible (NO TimescaleDB required)
-- Safe to re-run multiple times
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- IMPORTANT: Drop materialized views EARLY
-- so ALTER TABLE ... TYPE won't fail due to dependencies
-- ============================================
DROP MATERIALIZED VIEW IF EXISTS stock_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS latest_prices CASCADE;
DROP MATERIALIZED VIEW IF EXISTS latest_fundamentals CASCADE;

-- ============================================
-- CORE MARKET DATA TABLES
-- ============================================

-- Companies
CREATE TABLE IF NOT EXISTS companies (
    company_id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    exchange VARCHAR(50),
    currency VARCHAR(10),
    country VARCHAR(50),
    type VARCHAR(50),
    market_cap BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure all columns exist and have correct types
DO $$ BEGIN
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS sector VARCHAR(100);
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS exchange VARCHAR(50);
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS currency VARCHAR(10);
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS country VARCHAR(50);
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS type VARCHAR(50);
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS market_cap BIGINT;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
END $$;

-- Fix column sizes (safe now because views are already dropped)
ALTER TABLE companies ALTER COLUMN ticker TYPE VARCHAR(20);
ALTER TABLE companies ALTER COLUMN sector TYPE VARCHAR(100);
ALTER TABLE companies ALTER COLUMN industry TYPE VARCHAR(100);
ALTER TABLE companies ALTER COLUMN exchange TYPE VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_exchange ON companies(exchange);
CREATE INDEX IF NOT EXISTS idx_companies_country ON companies(country);

-- Price History
CREATE TABLE IF NOT EXISTS price_history (
    time TIMESTAMP NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    open NUMERIC(12,4),
    high NUMERIC(12,4),
    low NUMERIC(12,4),
    close NUMERIC(12,4),
    volume BIGINT,
    PRIMARY KEY (time, ticker)
);

ALTER TABLE price_history ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_price_history_ticker_time ON price_history(ticker, time DESC);

-- Price Intraday
CREATE TABLE IF NOT EXISTS price_intraday (
    time TIMESTAMP NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    open NUMERIC(12,4),
    high NUMERIC(12,4),
    low NUMERIC(12,4),
    close NUMERIC(12,4),
    volume BIGINT,
    PRIMARY KEY (time, ticker)
);

ALTER TABLE price_intraday ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_price_intraday_ticker_time ON price_intraday(ticker, time DESC);

-- Fundamentals Quarterly
CREATE TABLE IF NOT EXISTS fundamentals_quarterly (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    quarter VARCHAR(10) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_date DATE,
    revenue BIGINT,
    gross_profit BIGINT,
    ebitda BIGINT,
    operating_income BIGINT,
    net_income BIGINT,
    eps NUMERIC(10,4),
    operating_margin NUMERIC(8,4),
    profit_margin NUMERIC(8,4),
    roe NUMERIC(8,4),
    roa NUMERIC(8,4),
    pe_ratio NUMERIC(10,4),
    pb_ratio NUMERIC(10,4),
    ps_ratio NUMERIC(10,4),
    peg_ratio NUMERIC(10,4),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ticker, quarter, fiscal_year)
);

ALTER TABLE fundamentals_quarterly ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_fundamentals_quarterly_ticker ON fundamentals_quarterly(ticker);
CREATE INDEX IF NOT EXISTS idx_fundamentals_quarterly_period ON fundamentals_quarterly(ticker, fiscal_year DESC, quarter DESC);

-- Fundamentals Annual
CREATE TABLE IF NOT EXISTS fundamentals_annual (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_date DATE,
    revenue BIGINT,
    gross_profit BIGINT,
    ebitda BIGINT,
    operating_income BIGINT,
    net_income BIGINT,
    eps NUMERIC(10,4),
    total_assets BIGINT,
    total_liabilities BIGINT,
    shareholders_equity BIGINT,
    operating_margin NUMERIC(8,4),
    profit_margin NUMERIC(8,4),
    roe NUMERIC(8,4),
    roa NUMERIC(8,4),
    debt_to_equity NUMERIC(10,4),
    current_ratio NUMERIC(10,4),
    quick_ratio NUMERIC(10,4),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ticker, fiscal_year)
);

ALTER TABLE fundamentals_annual ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_fundamentals_annual_ticker ON fundamentals_annual(ticker);

-- Balance Sheet
CREATE TABLE IF NOT EXISTS balance_sheet (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    period VARCHAR(10) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_date DATE,
    total_assets BIGINT,
    current_assets BIGINT,
    total_liabilities BIGINT,
    current_liabilities BIGINT,
    long_term_debt BIGINT,
    short_term_debt BIGINT,
    shareholders_equity BIGINT,
    retained_earnings BIGINT,
    cash_and_equivalents BIGINT,
    inventory BIGINT,
    accounts_receivable BIGINT,
    accounts_payable BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ticker, period, fiscal_year)
);

ALTER TABLE balance_sheet ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_balance_sheet_ticker ON balance_sheet(ticker);

-- Income Statement
CREATE TABLE IF NOT EXISTS income_statement (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    period VARCHAR(10) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_date DATE,
    revenue BIGINT,
    cost_of_revenue BIGINT,
    gross_profit BIGINT,
    operating_expenses BIGINT,
    operating_income BIGINT,
    interest_expense BIGINT,
    income_before_tax BIGINT,
    income_tax_expense BIGINT,
    net_income BIGINT,
    ebitda BIGINT,
    eps_basic NUMERIC(10,4),
    eps_diluted NUMERIC(10,4),
    shares_outstanding BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ticker, period, fiscal_year)
);

ALTER TABLE income_statement ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_income_statement_ticker ON income_statement(ticker);

-- Cashflow Statements
CREATE TABLE IF NOT EXISTS cashflow_statements (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    period VARCHAR(10) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_date DATE,
    operating_cashflow BIGINT,
    investing_cashflow BIGINT,
    financing_cashflow BIGINT,
    capex BIGINT,
    free_cash_flow BIGINT,
    dividends_paid BIGINT,
    stock_buyback BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ticker, period, fiscal_year)
);

ALTER TABLE cashflow_statements ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_cashflow_ticker ON cashflow_statements(ticker);

-- Debt Profile
CREATE TABLE IF NOT EXISTS debt_profile (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    quarter VARCHAR(10) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    short_term_debt BIGINT,
    long_term_debt BIGINT,
    total_debt BIGINT,
    debt_to_equity NUMERIC(10,4),
    debt_to_assets NUMERIC(10,4),
    interest_coverage NUMERIC(10,4),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ticker, quarter, fiscal_year)
);

ALTER TABLE debt_profile ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_debt_profile_ticker ON debt_profile(ticker);

-- Analyst Estimates
CREATE TABLE IF NOT EXISTS analyst_estimates (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    estimate_date DATE NOT NULL,
    eps_estimate NUMERIC(10,4),
    revenue_estimate BIGINT,
    price_target_low NUMERIC(12,4),
    price_target_avg NUMERIC(12,4),
    price_target_high NUMERIC(12,4),
    analyst_count INTEGER,
    rating VARCHAR(20),
    rating_score NUMERIC(3,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ticker, estimate_date)
);

ALTER TABLE analyst_estimates ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_analyst_estimates_ticker ON analyst_estimates(ticker);
CREATE INDEX IF NOT EXISTS idx_analyst_estimates_date ON analyst_estimates(estimate_date DESC);

-- Earnings Calendar
CREATE TABLE IF NOT EXISTS earnings_calendar (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    earnings_date DATE NOT NULL,
    fiscal_quarter VARCHAR(10),
    fiscal_year INTEGER,
    estimated_eps NUMERIC(10,4),
    actual_eps NUMERIC(10,4),
    surprise_pct NUMERIC(8,4),
    time_of_day VARCHAR(20),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ticker, earnings_date)
);

ALTER TABLE earnings_calendar ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_earnings_calendar_ticker ON earnings_calendar(ticker);
CREATE INDEX IF NOT EXISTS idx_earnings_calendar_date ON earnings_calendar(earnings_date);

-- Dividends
CREATE TABLE IF NOT EXISTS dividends (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    ex_date DATE NOT NULL,
    payment_date DATE,
    record_date DATE,
    declaration_date DATE,
    amount NUMERIC(10,4),
    currency VARCHAR(10),
    frequency VARCHAR(20),
    type VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ticker, ex_date)
);

ALTER TABLE dividends ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_dividends_ticker ON dividends(ticker);
CREATE INDEX IF NOT EXISTS idx_dividends_ex_date ON dividends(ex_date DESC);

-- Stock Splits
CREATE TABLE IF NOT EXISTS stock_splits (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    split_date DATE NOT NULL,
    split_ratio VARCHAR(20),
    from_factor NUMERIC(10,4),
    to_factor NUMERIC(10,4),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ticker, split_date)
);

ALTER TABLE stock_splits ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_stock_splits_ticker ON stock_splits(ticker);

-- Corporate Actions
CREATE TABLE IF NOT EXISTS corporate_actions (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    announcement_date DATE NOT NULL,
    effective_date DATE,
    amount BIGINT,
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE corporate_actions ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_corporate_actions_ticker ON corporate_actions(ticker);
CREATE INDEX IF NOT EXISTS idx_corporate_actions_date ON corporate_actions(announcement_date DESC);

-- Technical Indicators
CREATE TABLE IF NOT EXISTS technical_indicators (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    indicator_date DATE NOT NULL,
    sma_20 NUMERIC(12,4),
    sma_50 NUMERIC(12,4),
    sma_200 NUMERIC(12,4),
    ema_12 NUMERIC(12,4),
    ema_26 NUMERIC(12,4),
    rsi_14 NUMERIC(8,4),
    macd NUMERIC(12,4),
    macd_signal NUMERIC(12,4),
    macd_histogram NUMERIC(12,4),
    bollinger_upper NUMERIC(12,4),
    bollinger_middle NUMERIC(12,4),
    bollinger_lower NUMERIC(12,4),
    atr_14 NUMERIC(12,4),
    adx_14 NUMERIC(8,4),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ticker, indicator_date)
);

ALTER TABLE technical_indicators ALTER COLUMN ticker TYPE VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_technical_indicators_ticker ON technical_indicators(ticker);

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- User Portfolio
CREATE TABLE IF NOT EXISTS user_portfolio (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticker VARCHAR(20) NOT NULL,
    quantity NUMERIC(15,4),
    average_price NUMERIC(12,4),
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, ticker)
);

CREATE INDEX IF NOT EXISTS idx_user_portfolio_user ON user_portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolio_ticker ON user_portfolio(ticker);

-- Watchlists
CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);

CREATE TABLE IF NOT EXISTS watchlist_items (
    id SERIAL PRIMARY KEY,
    watchlist_id INTEGER NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    ticker VARCHAR(20) NOT NULL,
    notes TEXT,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(watchlist_id, ticker)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist ON watchlist_items(watchlist_id);

-- Alert Subscriptions
CREATE TABLE IF NOT EXISTS alert_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticker VARCHAR(20),
    alert_name VARCHAR(200),
    alert_type VARCHAR(50),
    condition_dsl JSONB NOT NULL,
    frequency VARCHAR(20) DEFAULT 'daily',
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_user ON alert_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_ticker ON alert_subscriptions(ticker);
CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_active ON alert_subscriptions(is_active) WHERE is_active = TRUE;

-- Alert Notifications
CREATE TABLE IF NOT EXISTS alert_notifications (
    id SERIAL PRIMARY KEY,
    alert_subscription_id INTEGER NOT NULL REFERENCES alert_subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticker VARCHAR(20),
    message TEXT,
    triggered_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alert_notifications_user ON alert_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_unread ON alert_notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_alert_notifications_date ON alert_notifications(triggered_at DESC);

-- Saved Screens
CREATE TABLE IF NOT EXISTS saved_screens (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    screen_name VARCHAR(200),
    description TEXT,
    dsl_query JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_screens_user ON saved_screens(user_id);

-- Search History
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    query_text TEXT,
    dsl_query JSONB,
    result_count INTEGER,
    searched_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_date ON search_history(searched_at DESC);

-- Data Ingestion Log
CREATE TABLE IF NOT EXISTS data_ingestion_log (
    id SERIAL PRIMARY KEY,
    data_type VARCHAR(50) NOT NULL,
    ticker VARCHAR(20),
    status VARCHAR(20),
    records_processed INTEGER,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ingestion_log_type ON data_ingestion_log(data_type);
CREATE INDEX IF NOT EXISTS idx_ingestion_log_status ON data_ingestion_log(status);
CREATE INDEX IF NOT EXISTS idx_ingestion_log_date ON data_ingestion_log(started_at DESC);

-- ============================================
-- MATERIALIZED VIEWS (now safe to create)
-- ============================================

CREATE MATERIALIZED VIEW latest_fundamentals AS
SELECT DISTINCT ON (ticker)
    ticker,
    quarter,
    fiscal_year,
    revenue,
    net_income,
    eps,
    pe_ratio,
    pb_ratio,
    peg_ratio,
    roe,
    roa,
    operating_margin,
    profit_margin
FROM fundamentals_quarterly
WHERE ticker IS NOT NULL
ORDER BY ticker, fiscal_year DESC, quarter DESC;

CREATE UNIQUE INDEX idx_latest_fundamentals_ticker ON latest_fundamentals(ticker);

CREATE MATERIALIZED VIEW latest_prices AS
SELECT DISTINCT ON (ticker)
    ticker,
    time as last_updated,
    close as last_price,
    volume,
    high as day_high,
    low as day_low
FROM price_history
WHERE ticker IS NOT NULL
ORDER BY ticker, time DESC;

CREATE UNIQUE INDEX idx_latest_prices_ticker ON latest_prices(ticker);

CREATE MATERIALIZED VIEW stock_summary AS
SELECT
    c.ticker,
    c.name,
    c.sector,
    c.industry,
    c.exchange,
    c.market_cap,
    lp.last_price,
    lp.last_updated,
    lf.pe_ratio,
    lf.eps,
    lf.roe,
    lf.revenue,
    lf.net_income
FROM companies c
LEFT JOIN latest_prices lp ON c.ticker = lp.ticker
LEFT JOIN latest_fundamentals lf ON c.ticker = lf.ticker;

CREATE UNIQUE INDEX idx_stock_summary_ticker ON stock_summary(ticker);

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION calculate_peg_ratio(
    p_ticker VARCHAR,
    p_periods INTEGER DEFAULT 4
)
RETURNS NUMERIC AS $$
DECLARE
    v_pe_ratio NUMERIC;
    v_eps_growth NUMERIC;
    v_peg_ratio NUMERIC;
BEGIN
    SELECT pe_ratio INTO v_pe_ratio
    FROM fundamentals_quarterly
    WHERE ticker = p_ticker
    ORDER BY fiscal_year DESC, quarter DESC
    LIMIT 1;

    WITH eps_data AS (
        SELECT eps,
               ROW_NUMBER() OVER (ORDER BY fiscal_year DESC, quarter DESC) as rn
        FROM fundamentals_quarterly
        WHERE ticker = p_ticker AND eps IS NOT NULL
        LIMIT p_periods + 1
    )
    SELECT
        ((MAX(CASE WHEN rn = 1 THEN eps END) -
          MAX(CASE WHEN rn = p_periods + 1 THEN eps END)) /
         NULLIF(ABS(MAX(CASE WHEN rn = p_periods + 1 THEN eps END)), 0)) * 100
    INTO v_eps_growth
    FROM eps_data;

    IF v_pe_ratio IS NOT NULL AND v_eps_growth IS NOT NULL AND v_eps_growth > 0 THEN
        v_peg_ratio := v_pe_ratio / v_eps_growth;
    END IF;

    RETURN v_peg_ratio;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_debt_to_fcf(p_ticker VARCHAR)
RETURNS NUMERIC AS $$
DECLARE
    v_total_debt BIGINT;
    v_fcf BIGINT;
    v_ratio NUMERIC;
BEGIN
    SELECT total_debt INTO v_total_debt
    FROM debt_profile
    WHERE ticker = p_ticker
    ORDER BY fiscal_year DESC, quarter DESC
    LIMIT 1;

    SELECT free_cash_flow INTO v_fcf
    FROM cashflow_statements
    WHERE ticker = p_ticker
    ORDER BY fiscal_year DESC, period DESC
    LIMIT 1;

    IF v_total_debt IS NOT NULL AND v_fcf IS NOT NULL AND v_fcf > 0 THEN
        v_ratio := v_total_debt::NUMERIC / v_fcf::NUMERIC;
    END IF;

    RETURN v_ratio;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_all_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW latest_fundamentals;
    REFRESH MATERIALIZED VIEW latest_prices;
    REFRESH MATERIALIZED VIEW stock_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA
-- ============================================

INSERT INTO companies (ticker, name, sector, industry, exchange, currency, country, type, market_cap) VALUES
('AAPL', 'Apple Inc.', 'Technology', 'Consumer Electronics', 'NASDAQ', 'USD', 'USA', 'Common Stock', 3000000000000),
('MSFT', 'Microsoft Corporation', 'Technology', 'Software', 'NASDAQ', 'USD', 'USA', 'Common Stock', 2800000000000),
('GOOGL', 'Alphabet Inc.', 'Technology', 'Internet Services', 'NASDAQ', 'USD', 'USA', 'Common Stock', 1800000000000),
('AMZN', 'Amazon.com Inc.', 'Consumer Cyclical', 'Internet Retail', 'NASDAQ', 'USD', 'USA', 'Common Stock', 1700000000000),
('TSLA', 'Tesla Inc.', 'Consumer Cyclical', 'Auto Manufacturers', 'NASDAQ', 'USD', 'USA', 'Common Stock', 800000000000),
('RELIANCE.NSE', 'Reliance Industries Ltd', 'Energy', 'Oil & Gas', 'NSE', 'INR', 'India', 'Common Stock', 15000000000000),
('TCS.NSE', 'Tata Consultancy Services', 'Technology', 'IT Services', 'NSE', 'INR', 'India', 'Common Stock', 12000000000000),
('INFY.NSE', 'Infosys Ltd', 'Technology', 'IT Services', 'NSE', 'INR', 'India', 'Common Stock', 6500000000000),
('HDFCBANK.NSE', 'HDFC Bank Ltd', 'Financial', 'Banking', 'NSE', 'INR', 'India', 'Common Stock', 9000000000000),
('ITC.NSE', 'ITC Ltd', 'Consumer Defensive', 'Tobacco', 'NSE', 'INR', 'India', 'Common Stock', 5000000000000)
ON CONFLICT (ticker) DO NOTHING;

-- Schema Version
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_version (version, description) VALUES
(1, 'Production PostgreSQL schema - fully rerunnable')
ON CONFLICT (version) DO NOTHING;

-- Success message
DO $$
DECLARE
    company_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO company_count FROM companies;
    RAISE NOTICE '✓ Database schema applied successfully!';
    RAISE NOTICE '✓ Companies loaded: %', company_count;
    RAISE NOTICE '✓ Backend is ready to start!';
END $$;
