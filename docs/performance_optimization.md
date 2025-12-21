Performance Optimization Plan

1. Indexes
- Create index on companies(ticker) to speed up joins.
- Create index on price_history(ticker, time) to speed up time-series queries.
- Create index on fundamentals_quarterly(ticker).
- Create index on analyst_estimates(ticker).
- Create index on buybacks(ticker).

2. TimescaleDB use
- price_history is created as a hypertable on the "time" column using TimescaleDB.
- This allows efficient storage and querying of large amounts of time-series price data.
- Later, compression and retention policies can be added as data grows.

3. Query patterns
- Most queries will filter by ticker and time range (for charts and ML training).
- Screener queries will filter on fundamentals, estimates and events across many tickers.
- Pre-computed views or materialized views can be used for heavy screens if needed.

4. Scalability
- PostgreSQL stores relational data like companies and fundamentals.
- TimescaleDB stores price_history as time-series to keep reads fast as data grows.
- Additional read replicas or caching can be added in future stages if needed.
