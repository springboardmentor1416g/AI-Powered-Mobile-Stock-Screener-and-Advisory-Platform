-- Adds tables required by Task 6: metrics_normalized + ownership

CREATE TABLE IF NOT EXISTS metrics_normalized (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    period_type VARCHAR(10) NOT NULL,    -- 'quarterly' or 'annual'
    period_label VARCHAR(15) NOT NULL,   -- e.g. '2024-Q3' or '2024'
    currency VARCHAR(10) DEFAULT 'USD',
    revenue BIGINT,
    ebitda BIGINT,
    net_income BIGINT,
    eps NUMERIC(12,4),
    total_debt BIGINT,
    cash BIGINT,
    free_cash_flow BIGINT,
    pe_ratio NUMERIC(12,4),
    peg_ratio NUMERIC(12,4),
    pb_ratio NUMERIC(12,4),
    ps_ratio NUMERIC(12,4),
    debt_to_equity NUMERIC(12,4),
    debt_to_fcf NUMERIC(12,4),
    revenue_growth_yoy_pct NUMERIC(12,4),
    ebitda_growth_yoy_pct NUMERIC(12,4),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (ticker, period_type, period_label),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

CREATE INDEX IF NOT EXISTS idx_metrics_norm_ticker_period
    ON metrics_normalized(ticker, period_type, period_label);

CREATE TABLE IF NOT EXISTS ownership (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    as_of_date DATE NOT NULL,
    promoter_holding_pct NUMERIC(6,2),
    institutional_holding_pct NUMERIC(6,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (ticker, as_of_date),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

CREATE INDEX IF NOT EXISTS idx_ownership_ticker_date
    ON ownership(ticker, as_of_date DESC);
