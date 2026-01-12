-- Analyst estimates
INSERT INTO analyst_estimates
(ticker, eps_estimate, revenue_estimate, analyst_count)
VALUES
('TCS', 120.5, 250000, 18)
ON CONFLICT DO NOTHING;

-- Price targets
INSERT INTO price_targets
(ticker, target_low, target_avg, target_high, analyst_count)
VALUES
('TCS', 3200, 3600, 4000, 20)
ON CONFLICT DO NOTHING;

-- Buyback announcement
INSERT INTO buyback_announcements
(ticker, announcement_date, buyback_type, amount)
VALUES
('TCS', '2024-12-01', 'Open Market', 18000)
ON CONFLICT DO NOTHING;

-- Earnings calendar
INSERT INTO earnings_calendar
(ticker, earnings_date, fiscal_quarter, fiscal_year, status)
VALUES
('TCS', '2025-01-15', 'Q3', 2025, 'Confirmed')
ON CONFLICT DO NOTHING;
