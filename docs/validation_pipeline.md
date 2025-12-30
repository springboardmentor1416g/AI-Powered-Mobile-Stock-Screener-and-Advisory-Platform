# Validation Pipeline (Task 7)

## Purpose
Validates fundamentals + price history data before it is considered production-ready.

## What it checks
- Missing quarterly fields (revenue mandatory; EPS/EBITDA optional/medium)
- Quarter continuity (gaps, duplicates, future quarters)
- Numeric schema/type correctness
- QoQ outliers (revenue spike > 300%)
- Price spikes (> 40% day change) in last N days

## How to run

### Validate one ticker
```powershell
python -m backend.services.data_validation.validate_data --ticker AAPL --price-days 120
