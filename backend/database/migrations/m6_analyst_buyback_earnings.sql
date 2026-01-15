-- Migration: M6 - Analyst Estimates, Price Targets, Buyback Announcements & Earnings Calendar
-- Purpose: Enhanced ingestion tables with improved structure, validation, and normalization
-- Date: 2025-01-15
-- Status: Ready for production

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
    rating TEXT, -- 'Buy', 'Hold', 'Sell', 'Strong Buy', 'Strong Sell'
    rating_distribution JSONB, -- e.g., {"buy": 5, "hold": 3, "sell": 1}
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_apt_ticker FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE,
    CONSTRAINT check_price_target_range CHECK (price_target_low <= price_target_avg AND price_target_avg <= price_target_high),
    UNIQUE(ticker, provider, data_date)
);
COMMENT ON TABLE analyst_price_targets IS 'Analyst consensus price targets with ratings and analyst counts';

CREATE INDEX IF NOT EXISTS idx_apt_ticker_date ON analyst_price_targets (ticker, data_date DESC);
CREATE INDEX IF NOT EXISTS idx_apt_provider ON analyst_price_targets (provider);

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
    fiscal_year INT,
    fiscal_quarter INT, -- 1, 2, 3, 4
    eps_estimate NUMERIC,
    eps_low NUMERIC,
    eps_high NUMERIC,
    revenue_estimate BIGINT, -- in currency units
    revenue_low BIGINT,
    revenue_high BIGINT,
    num_analysts_eps INT,
    num_analysts_revenue INT,
    guidance_change VARCHAR(50), -- 'raised', 'lowered', 'maintained', 'reiterated'
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_aee_ticker FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE,
    CONSTRAINT check_eps_range CHECK (eps_low IS NULL OR eps_high IS NULL OR eps_low <= eps_high),
    CONSTRAINT check_revenue_range CHECK (revenue_low IS NULL OR revenue_high IS NULL OR revenue_low <= revenue_high),
    UNIQUE(ticker, provider, estimate_period, estimate_date)
);
COMMENT ON TABLE analyst_earnings_estimates IS 'Analyst EPS/revenue estimates with revision tracking for guidance changes';

CREATE INDEX IF NOT EXISTS idx_aee_ticker_period ON analyst_earnings_estimates (ticker, estimate_period);
CREATE INDEX IF NOT EXISTS idx_aee_fiscal_date ON analyst_earnings_estimates (ticker, fiscal_year, fiscal_quarter DESC);
CREATE INDEX IF NOT EXISTS idx_aee_estimate_date ON analyst_earnings_estimates (ticker, estimate_date DESC);

-- ============================================================================
-- TABLE: buyback_announcements
-- PURPOSE: Store corporate buyback announcements with structured metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS buyback_announcements (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    announcement_date DATE NOT NULL,
    effective_date DATE, -- when buyback can begin
    authorization_date DATE, -- board authorization date
    buyback_type VARCHAR(50), -- 'open_market', 'tender_offer', 'accelerated_share_repurchase'
    amount NUMERIC, -- buyback amount in currency units (e.g., USD millions)
    amount_currency VARCHAR(10) DEFAULT 'USD',
    share_count BIGINT, -- number of shares approved (if known)
    price_range_low NUMERIC, -- if tender offer or specific price range
    price_range_high NUMERIC,
    period_start DATE, -- buyback execution window start
    period_end DATE, -- buyback execution window end (expiration)
    status VARCHAR(50), -- 'active', 'completed', 'expired', 'cancelled'
    source VARCHAR(100), -- 'SEC_FILING', 'EXCHANGE_FILING', 'COMPANY_PRESS_RELEASE', 'NEWS'
    source_url TEXT,
    remarks TEXT, -- additional notes or conditions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_ba_ticker FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE,
    CONSTRAINT check_price_range CHECK (price_range_low IS NULL OR price_range_high IS NULL OR price_range_low <= price_range_high),
    CONSTRAINT check_date_sequence CHECK (period_end IS NULL OR period_start IS NULL OR period_start <= period_end),
    UNIQUE(ticker, announcement_date, source)
);
COMMENT ON TABLE buyback_announcements IS 'Corporate buyback/share repurchase announcements with authorization and execution details';

CREATE INDEX IF NOT EXISTS idx_ba_ticker_date ON buyback_announcements (ticker, announcement_date DESC);
CREATE INDEX IF NOT EXISTS idx_ba_period ON buyback_announcements (ticker, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_ba_status ON buyback_announcements (status);
CREATE INDEX IF NOT EXISTS idx_ba_source ON buyback_announcements (source);

-- ============================================================================
-- TABLE: earnings_calendar_schedule
-- PURPOSE: Store upcoming and historical earnings dates with metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS earnings_calendar_schedule (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    event_date DATE NOT NULL,
    fiscal_period VARCHAR(20), -- 'Q1', 'Q2', 'Q3', 'Q4', 'FY'
    fiscal_year INT,
    event_type VARCHAR(50), -- 'earnings_announcement', 'earnings_release', 'guidance_update'
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'postponed', 'announced', 'reported'
    eps_actual NUMERIC, -- filled after announcement
    eps_estimate NUMERIC,
    eps_surprise NUMERIC, -- (actual - estimate) / |estimate| * 100
    revenue_actual BIGINT,
    revenue_estimate BIGINT,
    market_cap_affected BIGINT, -- estimated market cap impact if available
    time_of_day VARCHAR(20), -- 'pre_market', 'market_open', 'market_close', 'after_hours'
    source VARCHAR(100), -- 'COMPANY', 'NASDAQ', 'NYSE', 'EXCHANGE', 'EARNINGS_CALENDAR_API'
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_ecs_ticker FOREIGN KEY (ticker) REFERENCES companies(ticker) ON DELETE CASCADE,
    UNIQUE(ticker, event_date, event_type)
);
COMMENT ON TABLE earnings_calendar_schedule IS 'Earnings calendar with dates, fiscal periods, actuals, and EPS surprises';

CREATE INDEX IF NOT EXISTS idx_ecs_ticker_date ON earnings_calendar_schedule (ticker, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_ecs_fiscal_period ON earnings_calendar_schedule (ticker, fiscal_year, fiscal_period);
CREATE INDEX IF NOT EXISTS idx_ecs_status ON earnings_calendar_schedule (status);
CREATE INDEX IF NOT EXISTS idx_ecs_upcoming ON earnings_calendar_schedule (ticker, event_date) WHERE event_date >= CURRENT_DATE AND status IN ('scheduled', 'confirmed');

-- ============================================================================
-- TABLE: ingestion_metadata
-- PURPOSE: Track data ingestion source reliability and update frequency
-- ============================================================================
CREATE TABLE IF NOT EXISTS ingestion_metadata (
    id SERIAL PRIMARY KEY,
    data_type VARCHAR(100) NOT NULL, -- 'analyst_price_targets', 'earnings_calendar', 'buyback_announcements', etc.
    source VARCHAR(100) NOT NULL,
    last_fetched TIMESTAMP WITH TIME ZONE,
    next_scheduled TIMESTAMP WITH TIME ZONE,
    record_count INT,
    success BOOLEAN,
    error_message TEXT,
    data_age_days INT,
    coverage_percentage NUMERIC, -- % of universe covered by this data
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(data_type, source)
);
COMMENT ON TABLE ingestion_metadata IS 'Tracks ingestion health, frequency, and data coverage for monitoring';

CREATE INDEX IF NOT EXISTS idx_ingestion_metadata_source ON ingestion_metadata (source);
CREATE INDEX IF NOT EXISTS idx_ingestion_metadata_type ON ingestion_metadata (data_type);

-- ============================================================================
-- DATA QUALITY & VALIDATION VIEWS
-- ============================================================================

-- View: Analyst target deviation from current price
CREATE OR REPLACE VIEW analyst_target_analysis AS
SELECT 
    apt.ticker,
    apt.data_date,
    c.name,
    c.sector,
    ph.close AS current_price,
    apt.price_target_avg,
    apt.price_target_low,
    apt.price_target_high,
    ROUND(((apt.price_target_avg - ph.close) / ph.close * 100)::numeric, 2) AS upside_downside_pct,
    apt.num_analysts,
    apt.rating,
    apt.provider
FROM analyst_price_targets apt
LEFT JOIN companies c ON apt.ticker = c.ticker
LEFT JOIN LATERAL (
    SELECT close 
    FROM price_history 
    WHERE ticker = apt.ticker 
    ORDER BY time DESC 
    LIMIT 1
) ph ON true
ORDER BY apt.ticker, apt.data_date DESC;

COMMENT ON VIEW analyst_target_analysis IS 'Analyst targets with upside/downside vs current market price';

-- View: Earnings calendar upcoming events
CREATE OR REPLACE VIEW upcoming_earnings AS
SELECT 
    ecs.ticker,
    c.name,
    ecs.event_date,
    ecs.fiscal_year,
    ecs.fiscal_period,
    ecs.event_type,
    ecs.status,
    ecs.eps_estimate,
    (ecs.event_date - CURRENT_DATE) AS days_to_event
FROM earnings_calendar_schedule ecs
LEFT JOIN companies c ON ecs.ticker = c.ticker
WHERE ecs.event_date >= CURRENT_DATE 
  AND ecs.status IN ('scheduled', 'confirmed')
ORDER BY ecs.event_date ASC;

COMMENT ON VIEW upcoming_earnings IS 'Upcoming earnings announcements in chronological order';

-- View: Recent and active buyback programs
CREATE OR REPLACE VIEW active_buyback_programs AS
SELECT 
    ba.ticker,
    c.name,
    ba.announcement_date,
    ba.buyback_type,
    ba.amount,
    ba.period_start,
    ba.period_end,
    ba.status,
    (ba.period_end - CURRENT_DATE) AS days_remaining,
    ba.source
FROM buyback_announcements ba
LEFT JOIN companies c ON ba.ticker = c.ticker
WHERE ba.status IN ('active', 'announced')
  AND (ba.period_end IS NULL OR ba.period_end >= CURRENT_DATE)
ORDER BY ba.period_end DESC;

COMMENT ON VIEW active_buyback_programs IS 'Currently active or recently announced buyback programs';

-- ============================================================================
-- GRANTS (Example - Adjust per deployment)
-- ============================================================================
-- GRANT SELECT ON analyst_price_targets TO analytics_readonly;
-- GRANT SELECT ON analyst_earnings_estimates TO analytics_readonly;
-- GRANT SELECT ON buyback_announcements TO analytics_readonly;
-- GRANT SELECT ON earnings_calendar_schedule TO analytics_readonly;
-- GRANT SELECT ON ingestion_metadata TO analytics_readonly;

-- ============================================================================
-- END MIGRATION
-- ============================================================================
