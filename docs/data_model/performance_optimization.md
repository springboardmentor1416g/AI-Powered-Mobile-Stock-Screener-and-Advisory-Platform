Indexes Added:
- INDEX on companies(ticker)
- INDEX on fundamentals_quarterly(ticker, quarter)
- INDEX on analyst_estimates(ticker)
- INDEX on buybacks(ticker)

TimescaleDB:
- price_history uses hypertable on time
- Automatic chunking enabled

Expected Benefits:
- Fast PEG & revenue growth filtering
- Efficient historical price scans
