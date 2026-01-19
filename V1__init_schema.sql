-- Migration V1: Initial database schema
-- This migration initializes core tables for the stock screener platform.
-- Source: backend/database/schema.sql

-- NOTE:
-- Schema is managed via migrations.
-- Do not modify tables directly outside migrations.

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
