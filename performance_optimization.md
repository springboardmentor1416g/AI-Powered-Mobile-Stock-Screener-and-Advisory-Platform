# Performance & Indexing Plan — Stock Screener Database
## Purpose
This document describes indexing, hypertable configuration, materialized views, caching and partitioning strategies to ensure fast screening queries, analytics, and ML training on PostgreSQL + TimescaleDB.

---

## Assumptions
- PostgreSQL 13+ (recommended 14+) with TimescaleDB 2.x installed.
- Price time-series stored in `price_history` hypertable (time column = `time`).
- Fundamentals and other tables contain historical rows but far fewer rows than price history.
- Hardware: at least 2 CPU cores, 8GB RAM for dev; scale up for production.

---

## 1. Hypertable configuration (price_history)
- Use TimescaleDB hypertable conversion: `SELECT create_hypertable('price_history','time', if_not_exists => true);`
- Choose chunk time interval: default is automatic; for daily data default chunking works. For intraday high-frequency data, consider chunk_time_interval = INTERVAL '7 days' or smaller depending on retention.
- Retention policy: Use `add_retention_policy` or continuous aggregate to downsample older data (e.g., keep 1-min for 30 days, 1-hour for 2 years).

### Recommended retention policy example
- Keep minute-level data for 30 days, aggregate to 1-hour for 2 years, daily forever.
- Use continuous aggregates to maintain downsampled views and reduce query costs.

---

## 2. Indexing strategy (fast lookups & joins)
**Price_history (hypertable)**:
- `CREATE INDEX idx_price_history_ticker_time_desc ON price_history (ticker, time DESC);`
  - Good for retrieving latest price per ticker.
- `CREATE INDEX idx_price_history_time ON price_history (time);`
  - Useful for time-range queries.
- Consider a partial index for volatile queries: `CREATE INDEX ON price_history (ticker, time DESC) WHERE time > now() - interval '30 days';`

**Fundamentals (quarterly / annual)**:
- `CREATE INDEX idx_fund_q_ticker_period ON fundamentals_quarterly (ticker, period_end DESC);`
- `CREATE INDEX idx_fund_a_ticker_year ON fundamentals_annual (ticker, year DESC);`

**Analyst estimates & events**:
- `CREATE INDEX idx_analyst_estimates_ticker_date ON analyst_estimates (ticker, estimate_date DESC);`
- `CREATE INDEX idx_buybacks_ticker_date ON buybacks (ticker, announcement_date DESC);`
- `CREATE INDEX idx_earnings_calendar_ticker_date ON earnings_calendar (ticker, next_earnings_date);`

**User / alerts**:
- `CREATE INDEX idx_user_portfolio_user ON user_portfolio (user_id);`
- `CREATE INDEX idx_watchlist_alerts_user ON watchlist_alerts (user_id);`

---

## 3. Materialized views & continuous aggregates
- Use materialized views for frequently used joins like latest fundamentals + latest price.
- Example materialized view `mv_latest_fundamentals` created to speed up joins.
- For time-series heavy aggregates, use TimescaleDB continuous aggregates:

```
CREATE MATERIALIZED VIEW matagg_daily_prices WITH (timescaledb.continuous) AS
SELECT time_bucket('1 day', time) AS day, ticker, avg(close) AS avg_close, max(high) AS max_high, min(low) AS min_low, sum(volume) AS total_volume
FROM price_history
GROUP BY day, ticker;
```

- Refresh continuous aggregates policy: use `add_continuous_aggregate_policy` to refresh frequently for recent windows and less frequently for older windows.

---

## 4. Query patterns & optimization tips
- When compiling DSL → SQL, always fetch **latest** fundamentals via subquery on `period_end` and **latest** price via `price_date` max subquery to avoid expensive scans.
- Use `LIMIT` and `OFFSET` carefully; prefer keyset pagination for large result sets.
- Avoid `SELECT *` in production queries. Only request required `output_fields`.
- For screener queries that scan many tickers, try to reduce the universe upfront (e.g., by sector or market_cap) to reduce scanned rows.
- Use EXPLAIN ANALYZE to check query plans. Ensure that indexes are being used.

---

## 5. Caching & Application-layer strategies
- Use Redis as a caching layer for frequently-run screeners and compiled SQL results.
- Cache compiled SQL templates keyed by DSL fingerprint (e.g., hash of normalized JSON), and cache result sets for short durations (e.g., 5-15 minutes) depending on freshness needs.
- Maintain a source-reliability cache for API-limited fields to avoid repeated expensive recomputation.

---

## 6. Hardware & scaling recommendations
- Dev: 2 vCPU, 8 GB RAM, 100 GB disk (SSD) — ok for a proof-of-concept with EOD data.  
- Prod: scale to 8+ vCPU, 32+ GB RAM, NVMe SSDs. Separate storage for WAL and data when possible for IOPS.
- Use read-replicas for heavy analytical queries and keep the writer node dedicated to ingestions.

---


