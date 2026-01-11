CREATE TABLE analyst_estimates (
    id SERIAL PRIMARY KEY,
    company_id INT,
    eps_estimate FLOAT,
    revenue_estimate FLOAT,
    analyst_count INT,
    revision_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
