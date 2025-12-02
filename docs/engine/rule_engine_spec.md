# Rule Engine Specification

## Overview
This document defines the DSL, supported operators, evaluation semantics, and example rules for the Stock Screener engine.

## DSL structure
{
  "filters": [
    {"field": "peg_ratio", "op": "<", "value": 3},
    {"field": "debt_to_fcf", "op": "<", "value": 4}
  ],
  "sort": {"field": "revenue_yoy_pct", "order": "desc"},
  "limit": 100
}

## Supported operators
- Numeric: <, <=, >, >=, ==, !=
- Ranges: BETWEEN
- Membership: IN
- Logical: AND, OR, NOT
- Existence: IS NULL, IS NOT NULL

## Evaluation notes
- Fields referenced must exist in the canonical field catalog.
- Comparison uses latest available period for fundamentals (latest period_end).
- Date filters support relative days (e.g., earnings_next_days <= 30).

## Example rules
- Low PEG, low debt:
  {"filters":[{"field":"peg_ratio","op":"<","value":3},{"field":"debt_to_fcf","op":"<","value":4}]}
- Upcoming earnings and buyback:
  {"filters":[{"field":"is_earnings_within_30d","op":"==","value":true},{"field":"buyback_announced","op":"==","value":true}]}
