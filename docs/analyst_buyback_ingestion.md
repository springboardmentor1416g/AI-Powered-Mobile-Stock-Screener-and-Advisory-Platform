# Analyst Estimates, Buyback & Earnings Ingestion

## Data Sources
- Analyst Estimates & Price Targets: Yahoo Finance (free), Alpha Vantage (sandbox)
- Buyback Announcements: NSE/BSE filings, company press releases
- Earnings Calendar: Yahoo Finance earnings calendar

## Ingestion Flow
1. Fetch raw data via API / CSV
2. Parse and normalize fields
3. Validate ranges and dates
4. Store into normalized DB tables
5. Log ingestion status and errors

## Normalization Rules
- Currency stored in INR
- Dates in YYYY-MM-DD
- Analyst targets must satisfy: Low ≤ Avg ≤ High
