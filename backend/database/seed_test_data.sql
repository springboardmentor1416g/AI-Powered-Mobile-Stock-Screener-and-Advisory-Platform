-- Seed script for test data
-- This file populates the database with test companies and test users

-- ===== INSERT TEST COMPANIES =====
INSERT INTO companies (ticker, name, sector, exchange, market_cap, volume_avg_30d) VALUES
('AAPL', 'Apple Inc.', 'Information Technology', 'NASDAQ', 3200000000000, 52000000),
('MSFT', 'Microsoft Corporation', 'Information Technology', 'NASDAQ', 2800000000000, 22000000),
('GOOGL', 'Alphabet Inc.', 'Information Technology', 'NASDAQ', 1800000000000, 18000000),
('TSLA', 'Tesla, Inc.', 'Consumer Cyclical', 'NASDAQ', 1200000000000, 120000000),
('AMZN', 'Amazon.com, Inc.', 'Consumer Cyclical', 'NASDAQ', 1600000000000, 45000000),
('NVDA', 'NVIDIA Corporation', 'Information Technology', 'NASDAQ', 1100000000000, 40000000),
('META', 'Meta Platforms, Inc.', 'Communication Services', 'NASDAQ', 900000000000, 15000000),
('JPM', 'JPMorgan Chase & Co.', 'Financials', 'NYSE', 500000000000, 8000000),
('V', 'Visa Inc.', 'Financials', 'NYSE', 550000000000, 6000000),
('WMT', 'Walmart Inc.', 'Consumer Defensive', 'NYSE', 450000000000, 7000000);

-- ===== INSERT TEST USERS =====
-- Password hashes are bcrypt hashes of "password123"
-- To generate: bcrypt.hash('password123', 10)
INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'testuser1@example.com', '$2b$10$K9h.Gpy.O2Lq5v4X1Y2Z9e4Jx5K9h3Gpy.O2Lq5v4X1Y2Z9e4Jx5K', 'Test User 1', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'testuser2@example.com', '$2b$10$K9h.Gpy.O2Lq5v4X1Y2Z9e4Jx5K9h3Gpy.O2Lq5v4X1Y2Z9e4Jx5K', 'Test User 2', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'testuser3@example.com', '$2b$10$K9h.Gpy.O2Lq5v4X1Y2Z9e4Jx5K9h3Gpy.O2Lq5v4X1Y2Z9e4Jx5K', 'Test User 3', NOW(), NOW());

-- ===== INSERT TEST PORTFOLIO DATA =====
INSERT INTO user_portfolio (user_id, ticker, quantity, avg_price, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'AAPL', 100, 175.50, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'MSFT', 50, 380.25, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'GOOGL', 25, 140.75, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'TSLA', 30, 240.00, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'NVDA', 40, 875.50, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'AMZN', 15, 165.30, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'META', 60, 340.00, NOW(), NOW());

-- ===== INSERT TEST WATCHLIST DATA =====
INSERT INTO watchlists (user_id, name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Tech Leaders', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'Dividend Stocks', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Growth Stocks', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Future Watch', NOW(), NOW());

-- ===== INSERT WATCHLIST ITEMS =====
INSERT INTO watchlist_items (watchlist_id, ticker, notes, added_at) VALUES
(1, 'AAPL', 'Strong tech leader with consistent growth', NOW()),
(1, 'MSFT', 'Cloud computing pioneer', NOW()),
(1, 'NVDA', 'AI chip dominant player', NOW()),
(2, 'JPM', 'Stable dividend payer', NOW()),
(2, 'V', 'Consistent dividend growth', NOW()),
(2, 'WMT', 'Retail dividend aristocrat', NOW()),
(3, 'TSLA', 'EV market leader', NOW()),
(3, 'AMZN', 'E-commerce and cloud dominance', NOW()),
(4, 'GOOGL', 'Search and advertising platform', NOW()),
(4, 'META', 'Social media and metaverse', NOW());

-- ===== INSERT TEST ALERTS =====
INSERT INTO watchlist_alerts (user_id, ticker, alert_type, alert_rule, name, evaluation_frequency, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'AAPL', 'price', '{"field":"close","operator":"<","value":170}', 'AAPL Price Drop Alert', 'daily', 'active', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'MSFT', 'price', '{"field":"close","operator":">","value":400}', 'MSFT Price Rise Alert', 'daily', 'active', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'GOOGL', 'fundamental', '{"field":"pe_ratio","operator":"<","value":25}', 'GOOGL PE Ratio Alert', 'weekly', 'active', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'TSLA', 'fundamental', '{"field":"revenue_growth","operator":">","value":10}', 'TSLA Revenue Growth Alert', 'monthly', 'inactive', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'NVDA', 'price', '{"field":"close","operator":"<","value":800}', 'NVDA Support Level Alert', 'daily', 'active', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'AMZN', 'fundamental', '{"and":[{"field":"pe_ratio","operator":"<","value":40},{"field":"revenue_growth","operator":">","value":8}]}', 'AMZN Complex Alert', 'weekly', 'active', NOW(), NOW());

-- Display confirmation
SELECT 'Database seeding completed successfully' AS status;
SELECT COUNT(*) AS company_count FROM companies;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS portfolio_count FROM user_portfolio;
SELECT COUNT(*) AS watchlist_count FROM watchlists;
SELECT COUNT(*) AS watchlist_item_count FROM watchlist_items;
SELECT COUNT(*) AS alert_count FROM watchlist_alerts;
