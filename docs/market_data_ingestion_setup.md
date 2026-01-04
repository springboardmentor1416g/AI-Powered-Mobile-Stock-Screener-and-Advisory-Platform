# Market Data Ingestion Setup

<<<<<<< HEAD
This document explains how market data is fetched from the provider,
stored in the raw storage layer, processed, and finally inserted into
the TimescaleDB database.

## Components

### 1. Market Data API Module
Located at:
`backend/services/market_data_service.py`

Responsibilities:
- Fetch company metadata
- Fetch historical OHLCV data
- Wrap provider API responses

### 2. Ingestion Pipeline
Located at:
`backend/ingestion/data_ingestion.py`

Responsibilities:
- Download market data for selected tickers
- Save raw JSON to storage (`storage/raw/YYYY-MM-DD/`)
- Normalize and insert data into `price_history`
- Commit data to TimescaleDB

### 3. Raw Storage Layer
Folder:
`storage/raw/`

This folder keeps unmodified API snapshots that help in debugging and auditing.

### 4. Database Validation
SQL script:
`backend/ingestion/db_validation.sql`

Validates:
- Record count per ticker
- Newest timestamps
- Data freshness

## Running Ingestion

=======
## Provider
- Using Alpha Vantage as example market data provider.
- It supports daily OHLCV data and basic company overview.

## Environment Variables
Configured in backend/.env.sample:

- MARKETDATA_API_KEY
- MARKETDATA_BASE_URL
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

## Code Structure

- backend/services/market_data_service.py  
  - Contains functions to call the external market data API:
    - fetch_daily_price_history(symbol)
    - fetch_company_overview(symbol)

- backend/ingestion/data_ingestion.py  
  - Runs ingestion for a small list of tickers.
  - Steps:
    1. Calls market_data_service to get JSON data.
    2. Saves raw JSON to storage/raw/YYYY-MM-DD/symbol.json.
    3. Inserts normalized OHLCV rows into price_history table.

- backend/ingestion/db_validation.sql  
  - SQL queries to verify that data exists in price_history.

## Storage Layout

- storage/raw/YYYY-MM-DD/<symbol>.json  
  - Raw API responses, useful for debugging and replay.

- logs/ingestion_demo.log  
  - Placeholder log file. In a real system, the ingestion script would append logs here.

## Notes
- This is an initial pipeline skeleton.
- In future, this can be attached to a scheduler (cron, Airflow, etc.) for daily ingestion.
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
