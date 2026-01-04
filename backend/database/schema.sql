<<<<<<< HEAD
-- Core company metadata
CREATE TABLE IF NOT EXISTS companies (
=======
CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE companies (
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
    company_id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) UNIQUE NOT NULL,
    name TEXT,
    sector VARCHAR(50),
    industry VARCHAR(100),
    exchange VARCHAR(20),
    market_cap BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

<<<<<<< HEAD
-- Time-series price data
CREATE TABLE IF NOT EXISTS price_history (
=======
CREATE TABLE price_history (
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
    time TIMESTAMP NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC,
    volume BIGINT,
    PRIMARY KEY (time, ticker)
);
<<<<<<< HEAD

SELECT create_hypertable('price_history', 'time', if_not_exists => TRUE);

-- Quarterly fundamentals
CREATE TABLE IF NOT EXISTS fundamentals_quarterly (
=======
SELECT create_hypertable('price_history','time');

CREATE TABLE fundamentals_quarterly (
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10),
    quarter VARCHAR(10),
    revenue BIGINT,
    net_income BIGINT,
    eps NUMERIC,
    operating_margin NUMERIC,
    roe NUMERIC,
    roa NUMERIC,
    pe_ratio NUMERIC,
    pb_ratio NUMERIC,
    created_at TIMESTAMP DEFAULT NOW()
);

<<<<<<< HEAD
-- Analyst estimates
CREATE TABLE IF NOT EXISTS analyst_estimates (
=======
CREATE TABLE analyst_estimates (
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10),
    estimate_date DATE,
    eps_estimate NUMERIC,
    revenue_estimate BIGINT,
    price_target_low NUMERIC,
    price_target_avg NUMERIC,
    price_target_high NUMERIC
);

<<<<<<< HEAD
-- Buybacks
CREATE TABLE IF NOT EXISTS buybacks (
=======
CREATE TABLE buybacks (
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10),
    announcement_date DATE,
    amount BIGINT,
    remarks TEXT
);

<<<<<<< HEAD
-- Cashflow statements
CREATE TABLE IF NOT EXISTS cashflow_statements (
=======
CREATE TABLE cashflow_statements (
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10),
    period VARCHAR(10),
    cfo BIGINT,
    cfi BIGINT,
    cff BIGINT,
    capex BIGINT
);

<<<<<<< HEAD
-- Debt profile
CREATE TABLE IF NOT EXISTS debt_profile (
=======
CREATE TABLE debt_profile (
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(10),
    quarter VARCHAR(10),
    short_term_debt BIGINT,
    long_term_debt BIGINT,
    debt_to_equity NUMERIC
);
<<<<<<< HEAD
=======
-- USERS TABLE (AUTH MODULE)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
