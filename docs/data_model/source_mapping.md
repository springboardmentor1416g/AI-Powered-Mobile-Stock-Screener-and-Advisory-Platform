# Source Mapping — Final
**Project:** AI-Powered Mobile Stock Screener and Advisory Platform

---

## Purpose
Map each field from the Field Catalog to one or more data sources (APIs or feeds), note freshness, access considerations (free vs paid), and any computation required. This document is intended for the ingestion and backend teams and is submission-ready for the project kickoff deliverable.

---

## Summary
- For the MVP (NSE only) we recommend providers that cover Indian markets and supply fundamentals + price history. Recommended stack for MVP:
  - **Primary price/time-series:** Twelve Data (paid tiers) or Yahoo Finance (prototyping)
  - **Primary fundamentals & financial statements:** FinancialModelingPrep (FMP) or Twelve Data (if available)
  - **Analyst aggregates / price targets:** Yahoo Finance aggregates (prototype) or paid providers (Refinitiv / I/B/E/S) for production
  - **Corporate actions & filings:** Exchange corporate actions (NSE/BSE) — authoritative for buybacks/dividends (may require data agreements)
  - **News & sentiment:** NewsAPI / GDELT or a paid news provider; sentiment computed via in-house model
- For the submission, we select **Twelve Data** (prices) + **FinancialModelingPrep** (fundamentals) + **Yahoo Finance** (fallback for analyst targets). Document chosen vendors, API keys and access notes in the project repo.

---

## Field → Source mapping (core fields)
Each row lists: Field | Source(s) | Freshness | Access / Notes | Computation required

### Stock Metadata
- **symbol** | Exchange listing (NSE/BSE) or provider symbol list (Twelve Data / FMP) | Static (update periodically) | Use exchange+symbol composite key for multi-exchange support | —
- **company_name** | Market API (FMP / Twelve Data / Yahoo) | EOD | Provider metadata field | —
- **exchange** | Exchange metadata or provider | EOD | Use to disambiguate tickers across markets | —
- **sector** | Provider metadata (FMP / Twelve Data / Yahoo) | EOD | If missing, add manual mapping table | —

### Price & Time-series
- **latest_price**, **daily_ohlcv_date**, **open**, **high**, **low**, **close**, **volume** | Twelve Data / Yahoo Finance | EOD (MVP) or intraday (paid tiers) | For MVP use EOD daily snapshots; for intraday use 1-min bars from provider | Store as TimescaleDB hypertable `price_history(symbol, price_date)`

### Fundamentals & Financials
- **pe**, **pb**, **peg**, **eps**, **revenue_ttm**, **ebitda**, **debt**, **free_cash_flow** | FinancialModelingPrep / Twelve Data / Provider financials | EOD / Quarterly | Some values may be TTM; prefer provider TTM fields where available | **Compute** derived fields when missing (see Computed Fields section)

- **revenue_qoq**, **revenue_yoy** | Compute from quarterly statements (provider raw statements via FMP/Exchange) | Quarterly | Compute from quarterly revenue rows | Computation required (see below)

- **debt_to_fcf** | Computed: `debt / free_cash_flow` | Quarterly | If `free_cash_flow <= 0`, mark as `NULL` or sentinel and handle in screeners | Computation required

### Analyst Estimates & Targets
- **analyst_rating**, **analyst_target_low**, **analyst_target_avg**, **analyst_target_high** | Yahoo Finance aggregates (prototype) / Paid providers (Refinitiv, I/B/E/S) | Daily | Production-grade coverage requires paid vendor; Yahoo is fallback | Compute `analyst_target_avg` if not provided

### Corporate Actions & Events
- **buyback_announced**, **buyback_details** | Exchange corporate actions feed (NSE/BSE) / Company filings / Press releases / News API | Immediate on announcement | Prefer exchange corporate actions feed for reliability. If not available, supplement with news-scrape and mark source | Parse details into JSON

- **dividend_yield**, **split_history** | Exchange feeds / Provider corporate actions endpoints | As announced | Use for historical price adjustments | —

### Earnings & Calendar
- **next_earnings_date**, **last_eps**, **eps_surprise** | Earnings calendar providers (Exchange calendar / FMP / company filings) | Daily | Next earnings date authoritative from exchange/company; eps_surprise computed from last_eps vs estimate | Computation required

### Risk & Sentiment
- **sentiment_score**, **news_count** | NewsAPI / GDELT / Paid news feeds + internal sentiment model (VADER/transformer) | Daily or hourly | Sentiment is best-effort; normalize scores across sources | Computation / ML required

### User & App Data (internal)
- **user_holdings_qty**, **user_avg_price**, **alert_rules_json** | Internal application DB (user input) | On user update | Sensitive data — protect via auth & encryption at rest | —

---

## Provider trade-offs & recommendations
- **Twelve Data**: Good for price/time-series; paid tiers give intraday resolution. Use for primary price ingestion for MVP if budget allows.
- **FinancialModelingPrep (FMP)**: Good fundamentals and financial statements endpoints; useful for computing YoY/QoQ metrics from raw statements.
- **Yahoo Finance**: Useful fallback for analyst targets and quick prototyping (via `yfinance`); TOS caution for commercial use — acceptable for prototypes, not for production without license.
- **Exchange data (NSE/BSE)**: Best source for corporate actions and earnings calendar; consider sourcing direct exchange feeds for production or use their published announcements for EOD ingest.
- **Analyst providers (Refinitiv / I/B/E/S / Bloomberg)**: High quality but paid — required for production-level analyst estimate coverage and historical analyst revisions.

---

## Computed fields & logic
- **peg**: If provider doesn't supply, compute as `peg = pe / annualized_eps_growth_rate` (ensure growth expressed as decimal or percent). If growth rate ≤ 0, handle as `NULL` or large sentinel.
- **debt_to_fcf**: `debt / free_cash_flow`. If `free_cash_flow <= 0`, set `NULL` and exclude from comparisons that assume positive FCF.
- **revenue_growth_yoy**: `(rev_current_quarter - rev_same_quarter_last_year) / rev_same_quarter_last_year * 100`.
- **target_low_diff_pct**: `(analyst_target_low - latest_price) / latest_price * 100`.
- **earnings_next_30d**: boolean computed by comparing `next_earnings_date` to current date.

---

## API rate-limiting & caching strategy
- Use **EOD snapshots** for fundamentals and corporate actions for MVP to reduce API calls and cost. Store snapshots in S3 for auditing and replay.
- For price data, if intraday is required, choose provider's paid tier; otherwise nightly EOD snapshots are sufficient for MVP.
- Use Redis for hot caching of frequently requested screener results to accelerate response time and reduce provider queries.
- Maintain a source-reliability log capturing last successful fetch timestamp, error rates, and missing fields.

---

## Missing data & fallback policies
- If analyst estimates are missing from the primary provider, fallback to Yahoo Finance or mark fields as `null` and display "Data not available" in UI.
- For buyback announcements: prefer exchange corporate actions feed. If not available, fallback to news-based detection and tag the source as "news-verified".
- If `free_cash_flow` or other key denominators are zero/negative, mark computed ratios as `null` and document behavior in the screener spec.

---

## Action items (next steps)
1. **Finalize vendor choices** and procure API keys for: Twelve Data (prices), FinancialModelingPrep (financials), Yahoo Finance (fallback/analyst targets). Document keys and rate limits in `/secrets/` (gitignored).
2. **Create ingestion scripts** in `/scripts/ingest/` for each provider and implement unit tests to verify field population for a sample universe of symbols.
3. **Implement computed-field functions** in the ingestion pipeline (peg, debt_to_fcf, revenue_yoy) and log computation anomalies.
4. **Schedule daily EOD snapshot jobs** (via cron / Airflow) to populate the database and S3 snapshots.
5. **Implement fallback and reliability logging** for missing/failed fields and ensure UI surfaces data-source provenance for sensitive fields (analyst targets, buyback flags).

---

## Appendix: Chosen MVP providers (submission)
- Prices / Time-series: **Twelve Data** (MVP) — EOD snapshots; upgrade to intraday if needed.
- Fundamentals / Financial Statements: **FinancialModelingPrep** — quarterly and annual statements, TTM fields.
- Analyst Targets: **Yahoo Finance** (fallback) — aggregated targets and ratings.
- Corporate Actions & Earnings Calendar: **NSE corporate announcements** + provider augmentation.
- News / Sentiment: **NewsAPI** + internal sentiment model for advisory layer.

---

*End of Source Mapping*
