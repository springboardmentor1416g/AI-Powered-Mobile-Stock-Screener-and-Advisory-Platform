-- db_validation.sql
-- Validation queries for Market Data Ingestion Pipeline
-- Run these queries after executing data_ingestion.js

---------------------------------------------
-- 1. Verify companies metadata ingestion
---------------------------------------------
SELECT ticker, name, sector, industry, exchange
FROM companies
ORDER BY ticker;

---------------------------------------------
-- 2. Verify price history row counts per ticker
---------------------------------------------
SELECT ticker, COUNT(*) AS total_rows
FROM price_history
GROUP BY ticker
ORDER BY ticker;

---------------------------------------------
-- 3. Fetch latest OHLCV for each ticker
---------------------------------------------
SELECT DISTINCT ON (ticker)
  ticker,
  time AS latest_date,
  open,
  high,
  low,
  close,
  volume
FROM price_history
ORDER BY ticker, time DESC;

---------------------------------------------
-- 4. Verify TimescaleDB hypertable configuration
---------------------------------------------
SELECT hypertable_name, number_of_chunks
FROM timescaledb_information.hypertables
WHERE hypertable_name = 'price_history';

---------------------------------------------
-- 5. Verify data freshness (latest 5 records for a sample ticker)
---------------------------------------------
SELECT *
FROM price_history
WHERE ticker = 'AAPL'
ORDER BY time DESC
LIMIT 5;

---------------------------------------------
-- 6. Check for duplicate records (should return zero rows)
---------------------------------------------
SELECT ticker, time, COUNT(*)
FROM price_history
GROUP BY ticker, time
HAVING COUNT(*) > 1;

---------------------------------------------
-- 7. Performance sanity check (recent data only)
---------------------------------------------
EXPLAIN ANALYZE
SELECT *
FROM price_history
WHERE ticker = 'AAPL'
  AND time >= NOW() - INTERVAL '30 days'
ORDER BY time DESC;

-- End of validation queries