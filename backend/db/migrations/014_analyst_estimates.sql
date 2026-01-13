CREATE TABLE analyst_estimates (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    fiscal_year INT,
    fiscal_quarter VARCHAR(5),
    eps_estimate NUMERIC(10,2),
    revenue_estimate BIGINT,
    analyst_count INT,
    revision_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
