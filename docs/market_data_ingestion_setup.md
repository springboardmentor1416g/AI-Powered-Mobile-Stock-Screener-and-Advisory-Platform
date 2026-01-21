# Market Data Integration & Ingestion Pipeline

## Market Data Provider
- Alpha Vantage (Free Tier)

## Data Types Ingested
- Daily OHLCV price data
- Basic stock metadata (symbol-based)

## Ingestion Flow
API → Raw JSON Storage → Data Transformation → PostgreSQL / TimescaleDB

## Raw Data Storage
- Stored as JSON files under storage/raw/YYYY-MM-DD/

## Database Tables Used
- companies
- price_history (TimescaleDB hypertable)

## Ingestion Frequency
- Manual execution (daily-ready)

## Validation
- SQL queries confirm data availability in price_history
