# Market Data Ingestion Setup

This module integrates a free/sandbox market data provider and
creates a pipeline for storing metadata and historical OHLCV pricing.

## Steps Implemented
1. API integration module created in `backend/services/market_data_service.py`
2. Data ingestion job created in `backend/ingestion/data_ingestion.py`
3. Raw API JSON responses stored in `storage/raw/`
4. TimescaleDB hypertable `price_history` populated
5. Validation SQL added in `backend/ingestion/db_validation.sql`
6. Logging enabled through `/logs/`

## Requirements
- API key stored in environment variable `MARKETDATA_API_KEY`
- PostgreSQL + TimescaleDB running
- Python dependencies installed (requests, psycopg2)
