CREATE TABLE price_targets (
    id SERIAL PRIMARY KEY,
    company_id INT,
    target_low FLOAT,
    target_avg FLOAT,
    target_high FLOAT,
    analyst_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (target_low <= target_avg AND target_avg <= target_high)
);
