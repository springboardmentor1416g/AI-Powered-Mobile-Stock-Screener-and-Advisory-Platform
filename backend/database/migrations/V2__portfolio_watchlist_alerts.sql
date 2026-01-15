-- V2__portfolio_watchlist_alerts.sql
-- Migration for User Portfolio, Watchlist & Alert Subscription Management
-- Extends existing user_portfolio and watchlist_alerts tables

-- 1) Enhance user_portfolio table (add unique constraint, improve structure)
ALTER TABLE IF EXISTS user_portfolio
  ADD CONSTRAINT IF NOT EXISTS uq_user_portfolio_ticker 
  UNIQUE (user_id, ticker);

-- Add FK constraint to companies table
ALTER TABLE IF EXISTS user_portfolio
  ADD CONSTRAINT IF NOT EXISTS fk_portfolio_ticker
  FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE;

-- 2) Create watchlists table (separate from alerts)
CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) DEFAULT 'My Watchlist',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);
COMMENT ON TABLE watchlists IS 'User watchlists - can have multiple watchlists per user';

-- 3) Create watchlist_items table
CREATE TABLE IF NOT EXISTS watchlist_items (
    id SERIAL PRIMARY KEY,
    watchlist_id INT NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    FOREIGN KEY (watchlist_id) REFERENCES watchlists(id) ON DELETE CASCADE,
    FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE,
    UNIQUE(watchlist_id, ticker)
);
COMMENT ON TABLE watchlist_items IS 'Stocks in each watchlist';

-- 4) Enhance watchlist_alerts table (rename and restructure)
-- First, check if we need to rename or enhance existing table
-- For now, we'll enhance the existing structure

-- Add missing columns to watchlist_alerts
ALTER TABLE IF EXISTS watchlist_alerts
  ADD COLUMN IF NOT EXISTS name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS alert_type VARCHAR(50) DEFAULT 'price', -- price, fundamental, event, time_based
  ADD COLUMN IF NOT EXISTS evaluation_frequency VARCHAR(20) DEFAULT 'daily', -- daily, hourly, realtime
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active', -- active, paused, triggered
  ADD COLUMN IF NOT EXISTS triggered_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_evaluated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE;

-- Rename table to alert_subscriptions for clarity (optional, but better naming)
-- We'll keep watchlist_alerts for backward compatibility but create a view
CREATE OR REPLACE VIEW alert_subscriptions AS
SELECT 
    id,
    user_id,
    ticker,
    alert_rule,
    active,
    name,
    alert_type,
    evaluation_frequency,
    status,
    triggered_at,
    last_evaluated_at,
    notification_sent,
    created_at,
    updated_at
FROM watchlist_alerts;

-- 5) Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_ticker ON watchlist_items(ticker);
CREATE INDEX IF NOT EXISTS idx_watchlist_alerts_user_ticker ON watchlist_alerts(user_id, ticker);
CREATE INDEX IF NOT EXISTS idx_watchlist_alerts_status ON watchlist_alerts(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_watchlist_alerts_type ON watchlist_alerts(alert_type);

-- 6) Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_portfolio
DROP TRIGGER IF EXISTS update_user_portfolio_updated_at ON user_portfolio;
CREATE TRIGGER update_user_portfolio_updated_at
    BEFORE UPDATE ON user_portfolio
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to watchlists
DROP TRIGGER IF EXISTS update_watchlists_updated_at ON watchlists;
CREATE TRIGGER update_watchlists_updated_at
    BEFORE UPDATE ON watchlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to watchlist_alerts
DROP TRIGGER IF EXISTS update_watchlist_alerts_updated_at ON watchlist_alerts;
CREATE TRIGGER update_watchlist_alerts_updated_at
    BEFORE UPDATE ON watchlist_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
