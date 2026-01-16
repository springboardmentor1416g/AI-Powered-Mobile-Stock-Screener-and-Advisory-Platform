-- schema.sql
-- SQL Schema for AI-Powered Mobile Stock Screener and Advisory Platform
-- PostgreSQL + TimescaleDB (create extension and hypertables)
-- Submission-ready: includes FK constraints, basic CHECKs, indexes, and notes.
-- NOTE: Run as a DB superuser or DB owner. Adjust owners as needed.

-- 0) Recommended pre-step (run as postgres / superuser)
-- createdb stock_screener
-- psql -d stock_screener -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"

-- 1) Create extension (if not already enabled)
--CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 2) Companies table (master registry)
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
COMMENT ON TABLE companies IS 'Master company registry and metadata';

-- 3) Symbols lookup (for multi-exchange support) - created next so FKs can reference it if preferred
CREATE TABLE IF NOT EXISTS symbols (
    symbol_id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    exchange VARCHAR(20) NOT NULL,
    company_id INT,
    isin VARCHAR(20),
    UNIQUE(ticker, exchange)
);
COMMENT ON TABLE symbols IS 'Lookup table to support composite key (ticker+exchange)';

-- Optional: link symbols.company_id -> companies.company_id (nullable)
ALTER TABLE IF EXISTS symbols
    ADD CONSTRAINT IF NOT EXISTS fk_symbols_company
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE SET NULL;

-- 4) Price history (TimescaleDB hypertable)
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
COMMENT ON TABLE price_history IS 'OHLCV time-series stored as TimescaleDB hypertable';

-- Convert to hypertable (idempotent)
--SELECT create_hypertable('price_history', 'time', if_not_exists => true);

-- Add basic FK note (we do NOT enforce FK on every timeseries insert for performance, but provide example)
-- If you want strict FK: uncomment the following (may slow bulk inserts):
-- ALTER TABLE price_history ADD CONSTRAINT fk_price_history_ticker
--   FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE;

-- 5) Fundamentals - Quarterly
CREATE TABLE IF NOT EXISTS fundamentals_quarterly (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL, -- e.g., 2025-04-01
    period_end DATE NOT NULL,   -- e.g., 2025-06-30
    quarter VARCHAR(10), -- e.g., Q1-2025 or 2025Q1
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
COMMENT ON TABLE fundamentals_quarterly IS 'Quarterly financial statements (per company)';

ALTER TABLE IF EXISTS fundamentals_quarterly
  ADD CONSTRAINT IF NOT EXISTS fk_fq_ticker
  FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE;

-- 6) Fundamentals - Annual
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
COMMENT ON TABLE fundamentals_annual IS 'Annual financial statements (per company)';

ALTER TABLE IF EXISTS fundamentals_annual
  ADD CONSTRAINT IF NOT EXISTS fk_fa_ticker
  FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE;

-- 7) Analyst estimates & price targets (multiple per ticker/date)
CREATE TABLE IF NOT EXISTS analyst_estimates (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    provider VARCHAR(100), -- e.g., Refinitiv, Yahoo, etc.
    estimate_date DATE,
    eps_estimate NUMERIC,
    revenue_estimate BIGINT,
    price_target_low NUMERIC,
    price_target_avg NUMERIC,
    price_target_high NUMERIC,
    rating TEXT, -- e.g., Buy/Hold/Sell
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE analyst_estimates IS 'Analyst EPS/revenue/price targets and consensus entries';

ALTER TABLE IF EXISTS analyst_estimates
  ADD CONSTRAINT IF NOT EXISTS fk_ae_ticker
  FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE;

-- 8) Buyback announcements / corporate actions
CREATE TABLE IF NOT EXISTS buybacks (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    announcement_date DATE,
    effective_date DATE,
    amount BIGINT, -- total buyback amount in currency units
    shares BIGINT, -- number of shares to be bought back if available
    remarks TEXT,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE buybacks IS 'Buyback/corporate action records (announcements)';

ALTER TABLE IF EXISTS buybacks
  ADD CONSTRAINT IF NOT EXISTS fk_buybacks_ticker
  FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE;

-- 9) Cashflow statements (periodic)
CREATE TABLE IF NOT EXISTS cashflow_statements (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    period_start DATE,
    period_end DATE,
    period_label VARCHAR(20),
    cfo BIGINT, -- cash from operations
    cfi BIGINT, -- cash from investing
    cff BIGINT, -- cash from financing
    capex BIGINT,
    free_cash_flow BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE cashflow_statements IS 'Cashflow statement rows for FCF and related metrics';

ALTER TABLE IF EXISTS cashflow_statements
  ADD CONSTRAINT IF NOT EXISTS fk_cf_ticker
  FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE;

-- 10) Debt profile (quarterly snapshots)
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
COMMENT ON TABLE debt_profile IS 'Debt snapshots including short/long-term debt and ratios';

ALTER TABLE IF EXISTS debt_profile
  ADD CONSTRAINT IF NOT EXISTS fk_debt_ticker
  FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE;

-- 11) Insider trades
CREATE TABLE IF NOT EXISTS insider_trades (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    trade_date DATE,
    insider_name TEXT,
    relation TEXT,
    trade_type TEXT, -- Buy / Sell / Other
    quantity BIGINT,
    price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE insider_trades IS 'Corporate insider trades for surveillance and event analysis';

ALTER TABLE IF EXISTS insider_trades
  ADD CONSTRAINT IF NOT EXISTS fk_insider_ticker
  FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE;

-- 12) Earnings calendar and events
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
COMMENT ON TABLE earnings_calendar IS 'Next earnings date and last EPS info for screening';

ALTER TABLE IF EXISTS earnings_calendar
  ADD CONSTRAINT IF NOT EXISTS fk_earnings_ticker
  FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE;

-- 13) User portfolio (internal application data)
CREATE TABLE IF NOT EXISTS user_portfolio (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    quantity NUMERIC,
    avg_price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE user_portfolio IS 'Per-user holdings; sensitive internal data';

-- 14) Watchlist alerts (user-defined rules)
CREATE TABLE IF NOT EXISTS watchlist_alerts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    alert_rule JSONB NOT NULL, -- structured rule DSL for alerts
    alert_type VARCHAR(50) DEFAULT 'price', -- 'price', 'fundamental', 'event'
    evaluation_frequency VARCHAR(50) DEFAULT 'daily', -- 'realtime', 'hourly', 'daily'
    active BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'triggered'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE watchlist_alerts IS 'User-defined alert rules stored as JSONB';

-- 15) Watchlists (user watchlist collections)
CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE watchlists IS 'User-created watchlist collections';

ALTER TABLE IF EXISTS watchlists
  ADD CONSTRAINT IF NOT EXISTS fk_watchlists_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 16) Watchlist items (stocks in a watchlist)
CREATE TABLE IF NOT EXISTS watchlist_items (
    id SERIAL PRIMARY KEY,
    watchlist_id INT NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE watchlist_items IS 'Individual stocks in a watchlist';

ALTER TABLE IF EXISTS watchlist_items
  ADD CONSTRAINT IF NOT EXISTS fk_watchlist_items_watchlist
  FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE;

-- 17) Alert trigger log (when alerts are triggered)
CREATE TABLE IF NOT EXISTS alert_triggers (
    id SERIAL PRIMARY KEY,
    alert_id INT NOT NULL,
    user_id UUID NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trigger_value JSONB, -- the actual values that triggered the alert
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE alert_triggers IS 'Log of when alerts are triggered';

ALTER TABLE IF EXISTS alert_triggers
  ADD CONSTRAINT IF NOT EXISTS fk_alert_triggers_alert
  FOREIGN KEY (alert_id) REFERENCES watchlist_alerts(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS alert_triggers
  ADD CONSTRAINT IF NOT EXISTS fk_alert_triggers_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 18) Notifications (user notifications from triggered alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    trigger_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    alert_type VARCHAR(50), -- 'price', 'fundamental', 'earnings', 'buyback'
    ticker VARCHAR(20),
    status VARCHAR(20) DEFAULT 'unread', -- unread, read, dismissed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);
COMMENT ON TABLE notifications IS 'User notifications from alert triggers';

ALTER TABLE IF EXISTS notifications
  ADD CONSTRAINT IF NOT EXISTS fk_notifications_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS notifications
  ADD CONSTRAINT IF NOT EXISTS fk_notifications_trigger
  FOREIGN KEY (trigger_id) REFERENCES alert_triggers(id) ON DELETE SET NULL;

-- 15) Data ingestion log (source reliability)
CREATE TABLE IF NOT EXISTS ingestion_log (
    id SERIAL PRIMARY KEY,
    source TEXT,
    entity TEXT,
    record_count BIGINT,
    success BOOLEAN,
    last_fetched TIMESTAMP WITH TIME ZONE,
    notes TEXT
);
COMMENT ON TABLE ingestion_log IS 'Records ingestion status for monitoring and debugging';

-- 19) Materialized view example: latest fundamentals per ticker (for fast joins)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_latest_fundamentals AS
SELECT fq.ticker,
       fq.period_end,
       fq.revenue,
       fq.net_income,
       fq.eps,
       fq.ebitda,
       fq.pe_ratio,
       fq.pb_ratio
FROM fundamentals_quarterly fq
JOIN (
    SELECT ticker, max(period_end) as max_period_end FROM fundamentals_quarterly GROUP BY ticker
) latest ON fq.ticker = latest.ticker AND fq.period_end = latest.max_period_end;

-- 20) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_history_ticker_time_desc ON price_history (ticker, time DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_time ON price_history (time);

CREATE INDEX IF NOT EXISTS idx_fundamentals_quarterly_ticker_period ON fundamentals_quarterly (ticker, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_fundamentals_annual_ticker_year ON fundamentals_annual (ticker, year DESC);

CREATE INDEX IF NOT EXISTS idx_analyst_estimates_ticker_date ON analyst_estimates (ticker, estimate_date DESC);

CREATE INDEX IF NOT EXISTS idx_buybacks_ticker_date ON buybacks (ticker, announcement_date DESC);

CREATE INDEX IF NOT EXISTS idx_cashflow_ticker_period ON cashflow_statements (ticker, period_end DESC);

CREATE INDEX IF NOT EXISTS idx_debt_profile_ticker_quarter ON debt_profile (ticker, period_end DESC);

CREATE INDEX IF NOT EXISTS idx_earnings_calendar_ticker_date ON earnings_calendar (ticker, next_earnings_date);

CREATE INDEX IF NOT EXISTS idx_symbols_ticker_exchange ON symbols (ticker, exchange);

CREATE INDEX IF NOT EXISTS idx_user_portfolio_user ON user_portfolio (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_alerts_user ON watchlist_alerts (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist ON watchlist_items (watchlist_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_ticker ON watchlist_items (ticker);
CREATE INDEX IF NOT EXISTS idx_alert_triggers_user ON alert_triggers (user_id);
CREATE INDEX IF NOT EXISTS idx_alert_triggers_ticker ON alert_triggers (ticker);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications (user_id, status);

CREATE INDEX IF NOT EXISTS idx_ingestion_log_source ON ingestion_log (source);

-- 21) Grants / Permissions (example - adjust per deployment)
-- CREATE ROLE analytics_readonly;
-- GRANT CONNECT ON DATABASE stock_screener TO analytics_readonly;
-- GRANT USAGE ON SCHEMA public TO analytics_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_readonly;

-- 22) Routine: refresh materialized views (example)
CREATE OR REPLACE FUNCTION refresh_materialized_views() RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_latest_fundamentals;
END;
$$;

-- End of schema.sql
