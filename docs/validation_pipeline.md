<<<<<<< HEAD
# Data Validation Pipeline

This module validates fundamentals & price history before loading into the production DB.

## Pipeline Flow
INGEST → VALIDATE → NORMALIZE → LOAD → CACHE

## What is Validated?
- Missing metrics
- Quarter continuity
- Outliers
- Invalid schema fields
- Wrong data types
- Duplicate or future quarters

## Output
- Log files stored at: `services/data_validation/logs/`
- Validation reports at: `services/data_validation/reports/`

## Blocking Rules
If HIGH severity issues are detected:
- DB load is aborted
- Logs are generated
=======
# Validation Pipeline

This module validates financial & price data before loading into the DB.

Steps:
1. Ingest raw data
2. Validate using validate_data.py
3. If HIGH severity → stop ingestion
4. If only WARN → continue with caution
5. Logs stored in /services/data_validation/logs/
6. Reports generated in /services/data_validation/reports/
    
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
