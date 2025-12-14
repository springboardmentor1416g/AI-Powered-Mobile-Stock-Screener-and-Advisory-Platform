## Fundamental Data Ingestion – Validation Report

### Data Source
- SimFin free financial datasets (CSV)
- Used strictly for academic and non-commercial purposes

### Validation Summary
- Quarterly and annual fundamentals ingested successfully
- Company-wise continuity verified
- Missing periods flagged using SQL checks
- Normalized metrics ready for screening queries

### Example Queries Tested
- Year-over-year revenue growth
- Quarterly completeness per company

## Fundamentals Ingestion Implementation

The fundamentals ingestion pipeline is implemented in Node.js.

### Key Files
- Ingestion Script:
  backend/ingestion/fundamentals_ingestion.js
- CSV Parsing Service:
  backend/services/fundamentals_data_service.js
- Database Schema:
  backend/database/fundamentals_schema.sql

### Data Provider
- SimFin (CSV-based bulk financial statements)

### Outputs
- PostgreSQL tables:
  - fundamentals_quarterly
  - fundamentals_annual
- Normalized CSVs:
  - data/processed/fundamentals/fundamentals_quarterly.csv
  - data/processed/fundamentals/fundamentals_annual.csv
