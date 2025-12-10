-- Show 5 most recent rows for a sample ticker
SELECT *
FROM price_history
WHERE ticker = 'AAPL'
ORDER BY time DESC
LIMIT 5;

-- Show row count per ticker
SELECT ticker, COUNT(*) AS row_count
FROM price_history
GROUP BY ticker
ORDER BY row_count DESC;

-- Check that companies table has some rows (if metadata loaded)
SELECT *
FROM companies
LIMIT 10;
