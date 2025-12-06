# Performance & Indexing Plan — Stock Screener Database

## 1. Time-Series: `price_history`

- Stored as a **TimescaleDB hypertable** on `time`.
- Common access patterns:
  - Filter by `ticker`
  - Restrict to a recent time window (e.g., last 6–12 months)
- Index:
  - `idx_price_history_ticker_time (ticker, time DESC)` to accelerate lookups.
- TimescaleDB configuration:
  - Chunk interval: `7 days` via `set_chunk_time_interval`.
  - Compression for chunks older than 30 days via `add_compression_policy`.
- Future optimizations:
  - Continuous aggregates for 1D/1W OHLCV summaries.
  - Separate read replicas for heavy dashboards.

---

## 2. Fundamentals & Valuation Filters

Tables:

- `fundamentals_quarterly`
- `fundamentals_annual`

Usage:

- Screener filters on:
  - `ticker`
  - `quarter` / `year`
  - valuation metrics (`pe_ratio`, `pb_ratio`)
  - profitability metrics (`roe`, `operating_margin`)

Indexes:

- `idx_fundamentals_q_ticker`
- `idx_fundamentals_q_quarter`
- `idx_fundamentals_a_ticker`
- `idx_fundamentals_a_year`
- Composite index `idx_screener_fundamentals (ticker, pe_ratio, roe, operating_margin)` to support multi-condition filters used by the LLM screener engine.

---

## 3. Analyst Estimates & Buybacks

Table: `analyst_estimates`

- Filters:
  - `ticker`
  - `estimate_date`
  - scenarios like “price below low target” (joined with latest estimates).

Index:

- `idx_analyst_ticker_date (ticker, estimate_date DESC)`

Table: `buybacks`

- Filters:
  - `ticker`
  - `announcement_date`
  - existence of buyback for screener rules.

(If needed, an index `(ticker, announcement_date)` can be added for heavier workloads.)

---

## 4. General Query Optimization Guidelines

- Always avoid `SELECT *` for heavy analytical queries; select only required columns.
- Use **parameterized queries** in backend services (no string concatenation).
- For long-running historical analytics, use:
  - Read replicas (in staging/prod).
  - Materialized views or continuous aggregates.
- Run regular maintenance:
  - `VACUUM ANALYZE` on high-write tables (`price_history`, `fundamentals_quarterly`).
  - Inspect `pg_stat_statements` and `pg_stat_user_indexes` for slow queries / unused indexes.

---

This plan ensures the stock screener can handle:
- Fast screening across thousands of stocks.
- Time-based analytics over large OHLCV histories.
- Integration with future ML workloads.
