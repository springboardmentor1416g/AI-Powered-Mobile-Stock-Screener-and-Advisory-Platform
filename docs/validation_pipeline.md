# Data Validation Pipeline

## Purpose
Ensure data quality before loading into production database.

## Flow
Ingest → Validate → Normalize → Load

## Checks Performed
- Missing fundamentals
- Quarter gaps
- Price anomalies

## Actions
- High severity: block DB insert
- Medium severity: log warning
- Low severity: allow insert
