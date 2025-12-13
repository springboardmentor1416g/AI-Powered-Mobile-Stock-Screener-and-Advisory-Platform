# Market Data Provider Integration & Data Ingestion Setup

**Project:** AI-Powered Mobile Stock Screener & Advisory Platform  
**Module:** Market Data Provider Integration & Data Ingestion Pipeline  
**Date:** 2025-12-13

---

## 1. Purpose of This Module

This module integrates an external financial market data provider and implements a complete data ingestion pipeline to populate the backend database with real stock market data.

This data is essential for:
- Stock screening based on price trends, valuation metrics, and volatility
- Time-series analytics using TimescaleDB
- Future machine learning models and alerting systems

Without this module, the screener and analytics components cannot function.

---

## 2. Selected Market Data Provider

### Provider: **Alpha Vantage**

**Reasons for selection:**
- Free-tier availability suitable for sandbox testing
- Official REST API (no scraping risk)
- Good documentation and stable endpoints
- Supports historical daily OHLCV data
- Easy to justify for academic and internship evaluation

**Scope for this phase:**
- Market: US stocks (NASDAQ / NYSE)
- Data Frequency: Daily (end-of-day)
- Mode: Historical + rolling daily updates
- Initial universe limited to avoid API rate limits

**Sample tickers used:**
```
AAPL, MSFT, GOOGL, AMZN, META,
NVDA, TSLA, INTC, AMD, NFLX
```

---

## 3. High-Level Architecture

```
Alpha Vantage API
        ↓
Backend Market Data Service
        ↓
Raw JSON Storage (filesystem)
        ↓
ETL Transformation
        ↓
PostgreSQL + TimescaleDB
```

This layered architecture separates API access, transformation, and storage, making the pipeline robust and debuggable.

---

## 4. Environment Configuration

### Required Environment Variables

These variables are never hardcoded and are managed using environment files and GitHub Actions Secrets.

```
MARKETDATA_API_KEY=<alpha_vantage_api_key>
MARKETDATA_BASE_URL=https://www.alphavantage.co
DATABASE_URL=postgresql://user:password@host:5432/stock_screener
```

---

## 5. Backend Components

### 5.1 Market Data API Integration Module

**Path:**
```
/backend/services/market_data_service.js
```

**Responsibilities:**
- Authenticate requests to Alpha Vantage
- Fetch daily OHLCV time-series data
- Fetch basic company metadata (overview)
- Handle API errors and rate limiting

This module only communicates with the external API and does not interact with the database directly.

---

### 5.2 Data Ingestion Pipeline

**Path:**
```
/backend/ingestion/data_ingestion.js
```

**Responsibilities:**
1. Iterate through predefined stock tickers
2. Fetch metadata and OHLCV data via the service layer
3. Store raw API responses for traceability
4. Transform raw JSON into normalized schema
5. Insert data into database tables
6. Log ingestion results

---

## 6. Raw Data Storage

Raw API responses are archived to the filesystem before transformation.

**Storage structure:**
```
/storage/raw/YYYY-MM-DD/
 ├── AAPL.json
 ├── MSFT.json
 ├── GOOGL.json
 └── ...
```

**Benefits:**
- Debugging API issues
- Reprocessing data without re-fetching
- Auditing and traceability

---

## 7. Logging & Monitoring

Each ingestion run generates a log file.

**Log location:**
```
/logs/ingestion_YYYY-MM-DD.log
```

**Logged information:**
- Ingestion start and completion
- Per-ticker success/failure
- API errors and rate-limit notices
- Database insertion errors

This ensures observability and operational transparency.

---

## 8. Database Storage Details

### Tables Used

#### companies
Stores company metadata:
- ticker
- name
- sector
- industry
- exchange
- market_cap

#### price_history (TimescaleDB Hypertable)
Stores daily OHLCV data:
- time
- ticker
- open
- high
- low
- close
- volume

A composite primary key `(time, ticker)` prevents duplicate records.

---

## 9. How to Run the Ingestion Pipeline

### Step 1: Set environment variables
```bash
export DATABASE_URL=postgresql://user:pass@host:5432/stock_screener
export MARKETDATA_API_KEY=your_api_key
export MARKETDATA_BASE_URL=https://www.alphavantage.co
```

### Step 2: Execute ingestion
```bash
node backend/ingestion/data_ingestion.js
```

### Expected Results
- Raw JSON files created in `/storage/raw/`
- Log file created in `/logs/`
- Database tables populated with price and metadata

---

## 10. Validation & Verification

### Validation Script
**Path:**
```
/backend/ingestion/db_validation.sql
```

### Run validation
```bash
psql $DATABASE_URL -f backend/ingestion/db_validation.sql
```

### Validation checks include:
- Company metadata presence
- OHLCV row counts per ticker
- Latest price availability
- TimescaleDB hypertable confirmation
- Duplicate record detection
- Query performance sanity checks

---

## 11. Limitations

- Alpha Vantage free tier has strict API rate limits
- Only daily price data is ingested (no intraday data)
- Initial stock universe is intentionally small
- Ingestion is manually triggered in this phase

These limitations are acceptable for the current development stage.

---

## 12. Outcome of This Module

At the completion of this module:
- Real market data is successfully ingested
- Database is populated with time-series stock prices
- Screener engine development can begin
- System is ready for analytics, alerts, and ML modeling

---

**End of Market Data Ingestion Setup Documentation**