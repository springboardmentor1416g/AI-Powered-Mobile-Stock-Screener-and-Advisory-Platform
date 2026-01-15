-- Migration: M6 - Complete Setup (Base Schema + Analyst Data)
-- Purpose: Create all necessary tables for M6 implementation
-- Date: 2025-01-15
-- Status: Production-ready

-- ============================================================================
-- PREREQUISITE: Ensure companies table exists (if not run base schema first)
-- ============================================================================
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

-- ============================================================================
-- TABLE: analyst_price_targets
-- PURPOSE: Store analyst price target estimates with consensus data
-- ============================================================================
CREATE TABLE IF NOT EXISTS analyst_price_targets (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    provider VARCHAR(100), -- e.g., 'Yahoo Finance', 'Refinitiv', 'MarketWatch'
    data_date DATE NOT NULL, -- date when consensus was recorded
    price_target_low NUMERIC CHECK (price_target_low > 0),
    price_target_avg NUMERIC CHECK (price_target_avg > 0),
    price_target_high NUMERIC CHECK (price_target_high > 0),
    num_analysts INT CHECK (num_analysts > 0),
    current_price NUMERIC CHECK (current_price > 0),
    rating TEXT, -- 'Buy', 'Hold', 'Sell', 'Strong Buy', 'Strong Sell'
    rating_distribution JSONB, -- e.g., {"buy": 5, "hold": 3, "sell": 1}
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_price_target_range CHECK (price_target_low <= price_target_avg AND price_target_avg <= price_target_high),
    UNIQUE(ticker, provider, data_date)
);
COMMENT ON TABLE analyst_price_targets IS 'Analyst consensus price targets with ratings and analyst counts';

CREATE INDEX IF NOT EXISTS idx_apt_ticker_date ON analyst_price_targets (ticker, data_date DESC);
CREATE INDEX IF NOT EXISTS idx_apt_provider ON analyst_price_targets (provider);
CREATE INDEX IF NOT EXISTS idx_apt_rating ON analyst_price_targets (rating);

-- ============================================================================
-- TABLE: analyst_earnings_estimates
-- PURPOSE: Store analyst EPS and revenue estimates with guidance revisions
-- ============================================================================
CREATE TABLE IF NOT EXISTS analyst_earnings_estimates (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    provider VARCHAR(100),
    estimate_period VARCHAR(20) NOT NULL, -- 'Q1-2025', '2025-FY', etc.
    estimate_date DATE NOT NULL,
    eps_estimate NUMERIC CHECK (eps_estimate > 0),
    eps_low NUMERIC,
    eps_high NUMERIC,
    revenue_estimate NUMERIC CHECK (revenue_estimate > 0),
    revenue_low NUMERIC,
    revenue_high NUMERIC,
    num_estimates INT CHECK (num_estimates > 0),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_eps_range CHECK (eps_low <= eps_estimate AND eps_estimate <= eps_high),
    CONSTRAINT check_rev_range CHECK (revenue_low <= revenue_estimate AND revenue_estimate <= revenue_high),
    UNIQUE(ticker, provider, estimate_period, estimate_date)
);
COMMENT ON TABLE analyst_earnings_estimates IS 'Analyst EPS and revenue estimates with guidance';

CREATE INDEX IF NOT EXISTS idx_aee_ticker_period ON analyst_earnings_estimates (ticker, estimate_period);
CREATE INDEX IF NOT EXISTS idx_aee_estimate_date ON analyst_earnings_estimates (estimate_date DESC);
CREATE INDEX IF NOT EXISTS idx_aee_provider ON analyst_earnings_estimates (provider);

-- ============================================================================
-- TABLE: buyback_announcements
-- PURPOSE: Store share repurchase program announcements and status
-- ============================================================================
CREATE TABLE IF NOT EXISTS buyback_announcements (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    announcement_date DATE NOT NULL,
    effective_date DATE,
    buyback_type VARCHAR(50) NOT NULL, -- 'open_market', 'accelerated_share_repurchase', 'tender_offer'
    amount NUMERIC CHECK (amount > 0),
    authorization_date DATE,
    expiration_date DATE,
    status VARCHAR(50), -- 'active', 'completed', 'suspended', 'cancelled'
    source VARCHAR(100), -- 'SEC_FILING', 'PRESS_RELEASE', 'NEWS'
    notes TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_buyback_type CHECK (buyback_type IN ('open_market', 'accelerated_share_repurchase', 'tender_offer', 'other')),
    CONSTRAINT check_status CHECK (status IN ('active', 'completed', 'suspended', 'cancelled')),
    UNIQUE(ticker, announcement_date, source)
);
COMMENT ON TABLE buyback_announcements IS 'Share repurchase program announcements and tracking';

CREATE INDEX IF NOT EXISTS idx_ba_ticker ON buyback_announcements (ticker);
CREATE INDEX IF NOT EXISTS idx_ba_announcement_date ON buyback_announcements (announcement_date DESC);
CREATE INDEX IF NOT EXISTS idx_ba_status ON buyback_announcements (status);
CREATE INDEX IF NOT EXISTS idx_ba_expiration ON buyback_announcements (expiration_date DESC);

-- ============================================================================
-- TABLE: earnings_calendar_schedule
-- PURPOSE: Store earnings announcement dates and history
-- ============================================================================
CREATE TABLE IF NOT EXISTS earnings_calendar_schedule (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    event_date DATE NOT NULL,
    fiscal_period VARCHAR(20), -- 'Q1', 'Q2', 'Q3', 'Q4', 'FY'
    fiscal_year INT,
    status VARCHAR(50), -- 'scheduled', 'reported', 'delayed', 'cancelled'
    eps_actual NUMERIC,
    eps_estimate NUMERIC,
    eps_surprise NUMERIC, -- (actual - estimate) / estimate * 100
    revenue_actual NUMERIC,
    revenue_estimate NUMERIC,
    revenue_surprise NUMERIC, -- (actual - estimate) / estimate * 100
    surprise_direction VARCHAR(20), -- 'beat', 'miss', 'inline', 'not_reported'
    time_of_day VARCHAR(20), -- 'pre_market', 'after_hours', 'during_hours'
    guidance_forward BOOLEAN DEFAULT FALSE,
    notes TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_ecs_status CHECK (status IN ('scheduled', 'reported', 'delayed', 'cancelled')),
    CONSTRAINT check_surprise_direction CHECK (surprise_direction IN ('beat', 'miss', 'inline', 'not_reported')),
    UNIQUE(ticker, event_date)
);
COMMENT ON TABLE earnings_calendar_schedule IS 'Earnings announcement dates with historical actuals and surprises';

CREATE INDEX IF NOT EXISTS idx_ecs_ticker_date ON earnings_calendar_schedule (ticker, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_ecs_event_date ON earnings_calendar_schedule (event_date DESC);
CREATE INDEX IF NOT EXISTS idx_ecs_fiscal_year ON earnings_calendar_schedule (ticker, fiscal_year DESC);
CREATE INDEX IF NOT EXISTS idx_ecs_status ON earnings_calendar_schedule (status);
CREATE INDEX IF NOT EXISTS idx_ecs_surprise ON earnings_calendar_schedule (eps_surprise DESC);

-- ============================================================================
-- TABLE: ingestion_metadata
-- PURPOSE: Track data freshness and ingestion status for monitoring
-- ============================================================================
CREATE TABLE IF NOT EXISTS ingestion_metadata (
    id SERIAL PRIMARY KEY,
    data_type VARCHAR(100) NOT NULL, -- 'analyst_targets', 'analyst_estimates', 'buyback_announcements', 'earnings_calendar'
    source VARCHAR(100) NOT NULL, -- 'Yahoo Finance', 'Polygon.io', 'CSV_Import'
    last_fetched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    record_count INT DEFAULT 0,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    tickers_processed INT DEFAULT 0,
    processing_time_ms INT,
    next_fetch TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE ingestion_metadata IS 'Audit trail and freshness monitoring for M6 data';

CREATE INDEX IF NOT EXISTS idx_ingestion_metadata_source ON ingestion_metadata (source);
CREATE INDEX IF NOT EXISTS idx_ingestion_metadata_type ON ingestion_metadata (data_type);
CREATE INDEX IF NOT EXISTS idx_ingestion_metadata_date ON ingestion_metadata (last_fetched DESC);

-- ============================================================================
-- MATERIALIZED VIEW: analyst_target_analysis
-- PURPOSE: Fast query for analyst target gaps and signals
-- ============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS analyst_target_analysis AS
SELECT 
    apt.ticker,
    apt.price_target_low,
    apt.price_target_avg,
    apt.price_target_high,
    apt.current_price,
    apt.num_analysts,
    apt.rating,
    apt.rating_distribution,
    ROUND(
        CASE 
            WHEN apt.current_price > 0 
            THEN ((apt.price_target_avg - apt.current_price) / apt.current_price * 100)::NUMERIC
            ELSE 0
        END, 2
    ) as upside_downside_pct,
    apt.data_date,
    apt.last_updated
FROM analyst_price_targets apt
WHERE apt.data_date = (
    SELECT MAX(data_date) 
    FROM analyst_price_targets 
    WHERE ticker = apt.ticker
);

CREATE INDEX IF NOT EXISTS idx_analyst_target_analysis_ticker ON analyst_target_analysis (ticker);
CREATE INDEX IF NOT EXISTS idx_analyst_target_analysis_upside ON analyst_target_analysis (upside_downside_pct DESC);

-- ============================================================================
-- MATERIALIZED VIEW: upcoming_earnings
-- PURPOSE: Fast query for upcoming earnings events
-- ============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS upcoming_earnings AS
SELECT 
    ecs.ticker,
    ecs.event_date,
    ecs.fiscal_period,
    ecs.fiscal_year,
    ecs.status,
    ecs.time_of_day,
    ecs.guidance_forward,
    (ecs.event_date - CURRENT_DATE) as days_to_event,
    CASE 
        WHEN (ecs.event_date - CURRENT_DATE) <= 7 THEN 'this_week'
        WHEN (ecs.event_date - CURRENT_DATE) <= 14 THEN 'next_week'
        WHEN (ecs.event_date - CURRENT_DATE) <= 30 THEN 'next_month'
        ELSE 'later'
    END as timeframe
FROM earnings_calendar_schedule ecs
WHERE ecs.status = 'scheduled' 
  AND ecs.event_date >= CURRENT_DATE
ORDER BY ecs.event_date ASC;

CREATE INDEX IF NOT EXISTS idx_upcoming_earnings_ticker ON upcoming_earnings (ticker);
CREATE INDEX IF NOT EXISTS idx_upcoming_earnings_date ON upcoming_earnings (event_date);

-- ============================================================================
-- MATERIALIZED VIEW: active_buyback_programs
-- PURPOSE: Fast query for active share repurchase programs
-- ============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS active_buyback_programs AS
SELECT 
    ba.ticker,
    ba.announcement_date,
    ba.buyback_type,
    ba.amount,
    ba.authorization_date,
    ba.expiration_date,
    (ba.expiration_date - CURRENT_DATE) as days_remaining,
    ba.status,
    ba.source,
    CASE 
        WHEN ba.status = 'active' AND ba.expiration_date > CURRENT_DATE THEN 'active'
        WHEN ba.status = 'active' AND ba.expiration_date <= CURRENT_DATE THEN 'expired'
        ELSE ba.status
    END as current_status
FROM buyback_announcements ba
WHERE ba.status IN ('active', 'completed')
ORDER BY ba.expiration_date DESC;

CREATE INDEX IF NOT EXISTS idx_active_buyback_programs_ticker ON active_buyback_programs (ticker);
CREATE INDEX IF NOT EXISTS idx_active_buyback_programs_status ON active_buyback_programs (current_status);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- All M6 tables, views, and indexes created successfully!
-- Next steps:
-- 1. Run: node backend/ingestion/analyst_buyback_earnings_ingestion.js --all
-- 2. Verify: SELECT COUNT(*) FROM analyst_price_targets;
-- 3. Query: SELECT * FROM analyst_target_analysis WHERE upside_downside_pct > 5;
