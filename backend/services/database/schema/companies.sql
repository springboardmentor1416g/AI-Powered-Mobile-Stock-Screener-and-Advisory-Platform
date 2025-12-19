CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20),
    name VARCHAR(255),
    exchange VARCHAR(50),
    sector VARCHAR(100),
    industry VARCHAR(100),
    market_cap BIGINT
);
