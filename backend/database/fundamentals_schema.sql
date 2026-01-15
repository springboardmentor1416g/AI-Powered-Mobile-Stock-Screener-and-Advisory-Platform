CREATE TABLE IF NOT EXISTS fundamentals_quarterly (
    ticker TEXT NOT NULL,
    fiscal_period DATE NOT NULL,
    revenue NUMERIC,
    gross_profit NUMERIC,
    ebitda NUMERIC,
    operating_income NUMERIC,
    net_income NUMERIC,
    eps NUMERIC,
    free_cash_flow NUMERIC,
    total_debt NUMERIC,
    cash NUMERIC,
    currency TEXT,
    source TEXT DEFAULT 'SIMFIN',
    PRIMARY KEY (ticker, fiscal_period)
);

CREATE TABLE IF NOT EXISTS fundamentals_annual (
    ticker TEXT NOT NULL,
    fiscal_year INT NOT NULL,
    revenue NUMERIC,
    ebitda NUMERIC,
    net_income NUMERIC,
    eps NUMERIC,
    free_cash_flow NUMERIC,
    total_debt NUMERIC,
    cash NUMERIC,
    currency TEXT,
    source TEXT DEFAULT 'SIMFIN',
    PRIMARY KEY (ticker, fiscal_year)
);

CREATE TABLE IF NOT EXISTS metrics_normalized (
    ticker TEXT NOT NULL,
    period DATE NOT NULL,
    revenue_growth_yoy NUMERIC,
    debt_to_fcf NUMERIC,
    pe_ratio NUMERIC,
    PRIMARY KEY (ticker, period)
);
