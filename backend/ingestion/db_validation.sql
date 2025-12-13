-- Validate price history ingestion
SELECT ticker, COUNT(*) AS records
FROM price_history
GROUP BY ticker;

-- Check newest price entry
SELECT *
FROM price_history
ORDER BY time DESC
LIMIT 10;
