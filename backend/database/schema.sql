-- Database schema : Stock screener

--COMPANIES TABLE 
CREATE TABLE IF NOT EXISTS companies (
    company_id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sector VARCHAR(50),
    industry VARCHAR(100),
    exchange VARCHAR(20),
    market_cap BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

--2. PRICE HISTORY
CREATE TABLE IF NOT EXISTS price_history(
    time TIMESTAMP NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    open NUMERIC(10,4),
    high NUMERIC(10,4),
    low NUMERIC(10,4),
    close NUMERIC(10,4),
    volume BIGINT,
    PRIMARY KEY (time,ticker)
);

-- CREATE EXTENSION IF NOT EXISTS timescaledb;
-- SELECT create_hypertable('price_history', 'time', if_not_exists => TRUE);
-- and configure chunking/compression policies.

--QUARTERLY FUNDAMENTALS

CREATE TABLE IF NOT EXISTS fundamentals_quarterly (
    id     SERIAL PRIMARY KEY,
    ticker   VARCHAR(10) NOT NULL,
    quarter    VARCHAR(10) NOT NULL,  -- e.g. '2024-Q3'
    revenue     BIGINT,
    net_income  BIGINT,
    eps     NUMERIC(10,4),
    operating_margin  NUMERIC(10,4),
    roe      NUMERIC(10,4),
    roa      NUMERIC(10,4),
    pe_ratio   NUMERIC(10,4),
    pb_ratio   NUMERIC(10,4),
    created_at   TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

-- ANNUAL FUNDAMENTALS 

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

--ANALYST ESTIMATES

CREATE TABLE IF NOT EXISTS analyst_estimates(
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    estimate_date DATE NOT NULL,
    eps_estimate NUMERIC(10,4),
    revenue_estimate BIGINT,
    price_target_low NUMERIC(10,4),
    price_target_avg NUMERIC(10,4),
    price_target_high NUMERIC(10,4),
    analyst_rating VARCHAR(32),
    FOREIGN KEY (ticker) REFERENCES COMPANIES(ticker)
);

--BUYBACKS

CREATE TABLE IF NOT EXISTS buybacks 
(
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    announcement_date DATE NOT NULL,
    amount BIGINT,
    remarks TEXT,
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

--CASHFLOW STATEMENTS

CREATE TABLE IF NOT EXISTS cashflow_statements(
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    period VARCHAR(10) NOT NULL,
    cfo BIGINT,   --CASHFLOW FROM OPERATIONS
    cfi BIGINT,   --CASHFLOW FROM INVESTING
    cff BIGINT,   --CASHFLOW FROM FINANCING
    capex BIGINT,
    FOREIGN KEY(ticker) REFERENCES companies(ticker)
);

--DEBT PROFILE 

CREATE TABLE IF NOT EXISTS debt_profile(
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) NOT NULL,
    quarter VARCHAR(10) NOT NULL,
    short_term_debt BIGINT,
    long_term_debt BIGINT,
    debt_to_equity NUMERIC(10,4),
    FOREIGN KEY (ticker) REFERENCES companies(ticker)
);

--INSIDER TRADES

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

-- _______________________________________________
--INDEXES
--_________________________________________________

--COMPANIES 
CREATE INDEX IF NOT EXISTS idx_companies_ticker 
ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_sector 
ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_industry 
ON companies(industries);
CREATE INDEX IF NOT EXISTS idx_companies_market_cap 
ON companies(market_cap);

--PRICE HISTORY
CREATE INDEX IF NOT EXISTS idx_price_history_ticker_time 
ON price_history(ticker, time desc);

--FUNDAMENTALS
CREATE INDEX IF NOT EXISTS idx_fundamentals_qticker 
ON fundamentals_quarterly(ticker);
CREATE INDEX IF NOT EXISTS idx_fundamentals_q_quarter 
ON fundamentals_quarterly(quarter);
CREATE INDEX IF NOT EXISTS idx_fundamentals_a_ticker 
ON fundamentals_annual(ticker);
CREATE INDEX IF NOT EXISTS idx_fundamentals_a_year 
ON fundamentals_annual(year);

--ANALYST ESTIMATES 
CREATE INDEX IF NOT EXISTS idx_analyst_ticker_date 
ON annalyst_estimates(ticker, estimate_date DESC);

--COMPOSITE INDEX FOR SCREENER QUERIES 
CREATE INDEX IF NOT EXISTS idx_screener_fundamentals
ON fundamentals_quarterly(ticker, pe_ratio, roe, operating_margin);

--Time-series index
CREATE INDEX IF NOT EXISTS idx_time_series_queries 
ON price_history(time, ticker, close);


