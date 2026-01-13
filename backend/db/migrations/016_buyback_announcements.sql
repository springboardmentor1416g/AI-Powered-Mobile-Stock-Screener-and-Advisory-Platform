CREATE TABLE buyback_announcements (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    announcement_date DATE,
    buyback_type VARCHAR(50),
    buyback_amount NUMERIC(15,2),
    buyback_percentage NUMERIC(5,2),
    price_range VARCHAR(50),
    start_date DATE,
    end_date DATE,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
