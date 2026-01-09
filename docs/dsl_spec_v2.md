# Screener DSL v2 – Extended Specification

## Overview
DSL v2 extends the original screener DSL to support:
- Time-windowed conditions
- Range expressions
- Nested logical rules
- Derived financial metrics
- Explicit missing-data handling

DSL remains:
- JSON-based
- Deterministic
- Safe for backend execution
- Independent of LLM provider

---

## Design Principles
- No raw SQL or executable code
- Explicit intent (no ambiguity)
- Validation before execution
- Backward-compatible with DSL v1
- Auditable and explainable

---

## Top-Level Structure

```json
{
  "filter": { ... },
  "meta": { ... }
}
```

### filter

Defines screener conditions using logical operators.

### meta (optional)

Execution hints (non-financial):

```json
{
  "exchange": "NSE",
  "currency": "INR"
}
```
## Logical Operators
### AND

```json
{
  "and": [ <condition>, <condition> ]
}
```

### OR

```json
{
  "or": [ <condition>, <condition> ]
}
```
### NOT

```json
{
  "not": <condition>
}
```
Nested logic is fully supported.

## Basic Condition (DSL v1 – Supported)

```json
{
  "field": "pe_ratio",
  "operator": "<",
  "value": 30
}
```
## Range Condition

```json
{
  "field": "pe_ratio",
  "range": {
    "min": 5,
    "max": 15,
    "inclusive": true
  }
}
```

### Rules:
- min and/or max must be present
- inclusive defaults to true

## Time-Windowed Condition
```json
{
  "field": "revenue_growth",
  "operator": ">",
  "value": 10,
  "window": {
    "type": "years",
    "length": 3,
    "aggregation": "avg"
  }
}
```
## Window Properties

| Field | Allowed Values |
|------|----------------|
| `type` | `quarters`, `years` |
| `length` | Integer > 0 |
| `aggregation` | `avg`, `sum`, `latest`, `cagr` |


## Trend Condition
```json
{
  "field": "eps",
  "trend": "increasing",
  "window": {
    "type": "quarters",
    "length": 4
  }
}
```
### Supported trends:
- `increasing`
- `decreasing`
- `stable`

## Derived Metrics
Derived metrics are referenced exactly like base metrics.

### Example:
```json
{
  "field": "peg_ratio",
  "operator": "<",
  "value": 1.5
}
```
## Derived Metrics (v2)

The following derived metrics are supported in **v2**:

- `peg_ratio`
- `debt_to_fcf`
- `eps_cagr`
- `revenue_cagr`
- `fcf_margin`

> Derived metrics must be **validated for safety** before execution.
> This includes checks for divide-by-zero, missing values, and invalid time windows.

## Missing Data Handling
```json
{
  "field": "debt_to_fcf",
  "operator": "<",
  "value": 5,
  "on_missing": "exclude"
}
```
### Allowed values:
- `exclude (default)`
- `fail`
- `use_latest`

## Invalid DSL Examples
### Unsatisfiable

```json
{
  "and": [
    { "field": "pe_ratio", "operator": "<", "value": 5 },
    { "field": "pe_ratio", "operator": ">", "value": 50 }
  ]
}
```
### Ambiguous

```json
{
  "field": "earnings",
  "operator": ">",
  "value": 0
}
```
**Reason:** Missing time window.

## Validation Requirement

Any **DSL v2** document **MUST**:

- Pass structural validation
- Pass logical consistency checks
- Pass metric availability checks
- Pass derived metric safety checks

Invalid DSL **MUST NOT** reach execution.

## Versioning
```json
{
  "meta": {
    "dsl_version": "2.0"
  }
}
```
If omitted, default version = 1.0.

## Summary

### DSL v2 enables:
- Safer execution
- Advanced screening logic
- Future LLM integration
- Explainable validation failures




