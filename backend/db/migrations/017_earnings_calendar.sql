CREATE TABLE earnings_calendar (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    earnings_date DATE,
    fiscal_year INT,
    fiscal_quarter VARCHAR(5),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
