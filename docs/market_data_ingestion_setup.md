# Market Data Ingestion Setup

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
