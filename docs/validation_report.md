# Fundamentals Ingestion Validation Report

## Scope
This report summarizes validation checks for the Fundamentals Ingestion & Normalization module.

## Datasets
- Tickers used for testing: AAPL, MSFT, GOOGL (sample universe)
- Metrics generated (simulated):
  - Revenue, EBITDA, Net Income, EPS
  - Total Debt, Cash, FCF
  - PE, PB, PS ratios
  - Promoter and institutional holdings

## Checks Performed (Conceptual)
1. **Time-series continuity**
   - Ensured 4 consecutive quarters exist per ticker (2024-Q1 to 2024-Q4).
2. **No missing key fields**
   - All rows contain ticker, period, revenue, net_income, eps, pe_ratio, pb_ratio.
3. **Normalized CSV structure**
   - Each ticker has a CSV under `data/processed/fundamentals/` with consistent headers.
4. **Database insertion**
   - fundamentals_quarterly receives rows with:
     - ticker, quarter, revenue, net_income, eps, pe_ratio, pb_ratio.

## Example SQL (for manual validation)
- Latest fundamentals:
```sql
SELECT ticker, quarter, revenue, net_income, eps, pe_ratio, pb_ratio
FROM fundamentals_quarterly
ORDER BY ticker, quarter;
