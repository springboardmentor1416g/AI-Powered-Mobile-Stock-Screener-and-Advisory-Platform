# Stock Screener DSL – Field Catalog

This document lists all financial fields allowed in the DSL.
Any field not listed here must be rejected during validation.

---

## Valuation Metrics
- pe_ratio
- peg_ratio
- price_to_book

## Ownership
- promoter_holding

## Profitability
- net_profit
- ebitda
- roe

## Growth
- revenue_growth_yoy
- earnings_growth_yoy

## Balance Sheet
- total_debt
- free_cash_flow
- debt_to_fcf

---

## Field Type Rules
| Field Category | Allowed Value Types |
|--------------|-------------------|
| Valuation | Number |
| Ownership | Percentage (0–100) |
| Profitability | Number |
| Growth | Percentage |
| Balance Sheet | Number |
