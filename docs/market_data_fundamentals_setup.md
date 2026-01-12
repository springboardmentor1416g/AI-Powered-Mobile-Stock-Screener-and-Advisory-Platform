# Task 6 — Fundamental Data Ingestion & Normalization

## Provider
Implemented provider: **Financial Modeling Prep (FMP)**

### Required env vars
- FUNDAMENTALS_PROVIDER=fmp
- FMP_API_KEY=...
- FMP_BASE_URL=https://financialmodelingprep.com/api/v3
- DEFAULT_CURRENCY=USD
- DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT

## DB Tables
Task 6 writes to:
- metrics_normalized (derived metrics + ratios)
- fundamentals_quarterly / fundamentals_annual (compatibility)

Migration SQL:
- backend/services/market_ingestion/sql/0002_fundamentals_extension.sql

## Run
Example (process up to 10 tickers):
```bash
python backend/services/market_ingestion/fundamentals_ingest.py --max-tickers 10
