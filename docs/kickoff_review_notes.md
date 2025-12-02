# Kickoff Review Notes

## Confirmed Decisions
- Market: NSE (Week 1)
- Database: PostgreSQL
- Data Freshness: End-of-Day (EOD)
- NLP Strategy: Template-based mapping to DSL
- Screener Scope: Fundamentals, Technicals, Analyst Estimates, Corporate Actions, Earnings

## Action Items
- Implement ingestion pipelines for Market API, Fundamentals API, and Corporate Actions API
- Populate `field_catalog.xlsx` and run initial database migrations
- Build DSL → SQL translation layer
- Add unit tests for the screening rule engine

## Approvals
- Product Owner: [Name]
- Data Provider: [Provider]