# DSL v2 Specification – Advanced Stock Screener

## 1. Purpose
DSL v2 defines a structured, machine-validated rule language used by the
backend screener engine. It enables safe, deterministic execution of
complex financial screening rules derived from user input or LLM output.

The DSL is the ONLY trusted input to the screener execution pipeline.
Natural language is explicitly excluded from validation and execution.

---

## 2. Design Principles
- Deterministic and unambiguous
- Machine-parseable (JSON-based)
- Validation-first (reject before execution)
- Safe for financial computations
- Independent of LLM behavior

---

## 3. DSL Structure Overview
DSL v2 is represented as a JSON object composed of logical operators
(`and`, `or`, `not`) and atomic rule expressions.

### Top-Level Structure
```json
{
  "and": [ <rule>, <rule>, ... ]
}
 4. Logical Operators
AND

All child rules must evaluate to true.

{
  "and": [ <rule1>, <rule2> ]
}

OR

At least one child rule must evaluate to true.

{
  "or": [ <rule1>, <rule2> ]
}

NOT

Negates a rule.

{
  "not": <rule>
}

5. Atomic Rule Types
5.1 Numeric Comparison Rule

Used for valuation, growth, leverage, and volume checks.

{
  "metric": "pe_ratio",
  "operator": "<",
  "value": 20
}


Supported operators:

>

<

>=

<=

=

5.2 Range Rule

Used for bounded checks.

{
  "metric": "pe_ratio",
  "range": {
    "min": 5,
    "max": 15
  }
}

5.3 Temporal Trend Rule

Used for time-windowed conditions.

{
  "metric": "eps",
  "trend": "positive",
  "periods": 4,
  "period_type": "quarter"
}


Supported trends:

positive

increasing

decreasing

5.4 Growth Rule (YoY / QoQ)
{
  "metric": "revenue_growth",
  "operator": ">",
  "value": 10,
  "unit": "percent",
  "period": "yoy"
}

6. Supported Metrics (v2 Scope)
Valuation

pe_ratio

peg_ratio (derived)

price_to_book

Growth

revenue_growth

eps_growth

eps_cagr (derived)

Leverage

debt_to_fcf (derived)

debt_to_equity

Market

price

volume

market_cap

Earnings

eps

ebitda

7. Derived Metrics (Reference Only)

Derived metrics are computed either:

Pre-computed in data layer, or

Calculated at runtime with strict validation

Examples:

PEG = PE Ratio / EPS Growth
Debt-to-FCF = Total Debt / Free Cash Flow


Derived metrics MUST define:

Valid denominator constraints

Minimum data availability

Safe fallback behavior

8. Missing Data Handling

Each rule may specify behavior when data is missing.

{
  "metric": "eps_growth",
  "operator": ">",
  "value": 10,
  "on_missing": "exclude"
}


Supported behaviors:

exclude (default)

fail

use_latest

9. Validation Rules (Pre-Execution)
Rule Consistency

Detect unsatisfiable conditions
Example:

pe_ratio < 5 AND pe_ratio > 50

Temporal Availability

Ensure required quarters / years exist

Derived Metric Safety

Prevent divide-by-zero

Prevent negative denominators

Ambiguity Detection

Missing period definition

Missing aggregation intent

10. Example Complete DSL v2 Query
{
  "and": [
    { "metric": "pe_ratio", "operator": "<", "value": 20 },
    { "metric": "debt_to_fcf", "operator": "<=", "value": 0.25 },
    {
      "metric": "eps",
      "trend": "positive",
      "periods": 4,
      "period_type": "quarter"
    },
    {
      "metric": "revenue_growth",
      "operator": ">",
      "value": 10,
      "unit": "percent",
      "period": "yoy"
    }
  ]
}

11. Execution Boundary

Only DSL queries that pass validation are eligible for compilation
into SQL or execution logic.

Invalid or ambiguous DSL queries are rejected with structured
validation errors before execution.

12. Versioning

This document defines DSL version v2.
All changes must be versioned to avoid silent behavior changes.

dsl_version: 2.0


---

# ✅ WHAT YOU HAVE DONE NOW

✔ You have **officially completed DSL v2 design**  
✔ This satisfies **Extended DSL Compiler – design phase**  
✔ This aligns with **Milestone M3 requirements**

---

# 🎯 WHAT WE DO NEXT (VERY CLEAR)

### NEXT STEP → **Backend Validation Rules (v2)**

We will now:
- Define **exact validation checks**
- Write them as **rules, not code**
- Then later map them to code safely
