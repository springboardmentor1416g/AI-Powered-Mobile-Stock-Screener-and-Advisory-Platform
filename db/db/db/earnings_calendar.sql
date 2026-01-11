CREATE TABLE earnings_calendar (
    id SERIAL PRIMARY KEY,
    company_id INT,
    earnings_date DATE,
    fiscal_quarter VARCHAR(10),
    fiscal_year INT,
    status VARCHAR(20)
);
