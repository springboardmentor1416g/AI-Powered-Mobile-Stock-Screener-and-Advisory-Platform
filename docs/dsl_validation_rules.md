# DSL Validation Rules

## Purpose
This document defines the validation rules applied to DSL (Domain-Specific Language) objects before they are executed by the Screener Engine.

The goal of DSL validation is to ensure:
- Safe and deterministic execution
- Prevention of malformed or ambiguous queries
- Complete isolation of LLM output from direct database access

---

## DSL Structure Overview

A valid DSL object must follow this high-level structure:

```json
{
  "and": [
    {
      "field": "pe_ratio",
      "operator": "<",
      "value": 30
    }
  ]
}
```
Only logical groupings and condition objects are allowed.

## Allowed Logical Operators

| Operator | Description |
|--------|-------------|
| `and` | All conditions must be satisfied |
| `or`  | At least one condition must be satisfied |

- Nested logical groups are allowed.
- ❌ Mixing `and` and `or` at the same level is **not allowed**.

---

## Condition Object Rules

Each condition **must** contain the following fields:

| Field    | Type   | Required |
|---------|--------|----------|
| `field` | string | Yes |
| `operator` | string | Yes |
| `value` | number | Yes |

---

## Example

```json
{
  "field": "revenue_growth_yoy",
  "operator": ">",
  "value": 10
}
```

## Allowed Fields (Current Version)

| Category | Fields |
|---------|--------|
| Valuation | `pe_ratio`, `peg_ratio` |
| Growth | `revenue_growth_yoy`, `earnings_growth_yoy` |
| Profitability | `net_profit`, `ebitda` |

- ❌ Any field **not in the whitelist** is rejected.

---

## Allowed Comparison Operators

| Operator | Meaning |
|---------|---------|
| `<`  | Less than |
| `>`  | Greater than |
| `<=` | Less than or equal |
| `>=` | Greater than or equal |
| `=`  | Equal |
| `!=` | Not equal |

- ❌ Unsupported operators are rejected.

## Value Constraints

- `value` must be **numeric**
- ❌ Strings, arrays, or objects are rejected
- ❌ `null` or `undefined` values are not allowed

---

## Rejection Rules

DSL execution is rejected if:

- Required keys are missing
- Field name is unsupported
- Operator is invalid
- Value is non-numeric
- Logical structure is malformed or empty

---

## Execution Safety Guarantees

- DSL is validated **before** compilation
- ❌ No raw SQL is accepted
- ✅ Parameterized queries only
- LLM output never directly reaches the database

---

## Summary

DSL validation ensures:

- Safe execution
- Predictable behavior
- Strong separation between AI parsing and database access
- Future extensibility without breaking changes

