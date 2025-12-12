# Market Data Ingestion Setup

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

