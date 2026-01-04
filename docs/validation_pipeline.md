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
