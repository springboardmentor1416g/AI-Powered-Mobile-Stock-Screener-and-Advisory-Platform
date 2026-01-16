-- V1 Initial Schema Migration
-- Creates core tables for stock screener platform

BEGIN;

-- Companies
CREATE TABLE IF NOT EXISTS companies (
    company_id SERIAL PRIMARY KEY,
    ticker VARCHAR(10) UNIQUE NOT NULL,
    name TEXT,
    sector VARCHAR(50),
    industry VARCHAR(100),
    exchange VARCHAR(20),
    market_cap BIGINT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Price history (TimescaleDB hypertable)
CREATE TABLE IF NOT EXISTS price_history (
    time TIMESTAMP NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC,
    volume BIGINT,
    PRIMARY KEY (time, ticker)
);

SELECT create_hypertable('price_history', 'time', if_not_exists => TRUE);

-- Quarterly fundamentals
CREATE TABLE IF NOT EXISTS fundamentals_quarterly (
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

COMMIT;
