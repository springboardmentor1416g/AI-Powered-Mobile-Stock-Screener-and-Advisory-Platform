CREATE TABLE buyback_announcements (
    id SERIAL PRIMARY KEY,
    company_id INT,
    announcement_date DATE,
    buyback_type VARCHAR(50),
    buyback_amount FLOAT,
    price_range VARCHAR(50),
    start_date DATE,
    end_date DATE,
    source VARCHAR(100)
);
