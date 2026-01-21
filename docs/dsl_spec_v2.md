# Extended DSL Specification (v2)

This document describes the extended DSL supported by the stock screener.

## 1. Basic Condition (existing)

Example:
PE less than 10

DSL:
{
  "field": "pe_ratio",
  "operator": "<",
  "value": 10
}

---

## 2. Range Condition (new)

Allows filtering within a range.

Example:
PE between 5 and 15

DSL:
{
  "field": "pe_ratio",
  "operator": "between",
  "value": [5, 15]
}

---

## 3. Time Window Condition (new)

Allows evaluation over multiple periods.

Example:
EPS positive over last 4 quarters

DSL:
{
  "field": "eps",
  "operator": "positive",
  "window": {
    "period": "quarter",
    "last": 4
  }
}

---

## 4. Missing Data Handling (new)

Controls behavior when data is unavailable.

Options:
- exclude → remove stock from results
- fail → stop execution
- fallback_latest → use latest available value

Example:
{
  "field": "revenue_growth",
  "operator": ">",
  "value": 10,
  "on_missing": "exclude"
}

