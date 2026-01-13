CREATE TABLE price_targets (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    low_target NUMERIC(10,2),
    average_target NUMERIC(10,2),
    high_target NUMERIC(10,2),
    analyst_count INT,
    currency VARCHAR(5),
    updated_at DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    CHECK (low_target <= average_target AND average_target <= high_target)
);
