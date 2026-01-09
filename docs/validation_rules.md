# Backend Validation Rules – Screener DSL & Derived Metrics

## 1. Purpose

This document defines the **backend validation rules** applied to all screener queries **before execution**.

The validation layer ensures that every query is:

- Safe
- Deterministic
- Structurally sound
- Logically consistent
- Free from ambiguous or unsafe computations

The validation layer sits **between**:

```
NL → DSL Translation → Validation Engine → Compiler → Runner
```

Its goal is to ensure that **only safe, deterministic, and meaningful queries** reach the execution layer.

---

## 2. Validation Philosophy

All validation rules follow these principles:

- **Fail Early** – Invalid queries are rejected before compilation
- **Fail Safe** – No partial or unsafe execution
- **Explainable** – Validation errors are structured and traceable
- **Deterministic** – Same DSL always yields the same validation outcome

---

## 3. Validation Pipeline Stages

Validation is performed in the following order:

1. Structural Validation  
2. Metric Validation  
3. Logical Consistency Validation  
4. Temporal Validation  
5. Derived Metric Safety Validation  
6. Data Availability Validation  

❌ Execution is **blocked** if any stage fails.

---

## 4. Structural Validation

### 4.1 DSL Shape Validation

**Rules:**

- DSL must be valid JSON
- Root node must be **one of**:
  - `and`
  - `or`
  - a single **condition object**

**Invalid examples:**
```json
{ "foo": "bar" }
{ "and": "pe < 10" }
```

### 4.2 Condition Structure

Each condition **must** contain the following fields:

| Field | Required |
|------|----------|
| `field` | Yes |
| `operator` | Yes |
| `value` | Yes (except for existence checks) |

**Optional fields:**

- `window`
- `null_handling`
- `aggregation`

---

## 5. Metric Validation

### 5.1 Allowed Metrics

Only metrics explicitly defined in the following registries are permitted:

- **Base Metrics Registry**
- **Derived Metrics Registry**

**Examples of valid metrics:**

- `pe_ratio`
- `revenue`
- `eps_cagr`
- `peg_ratio`

**Invalid:**
```json
{ "field": "magic_score", "operator": ">", "value": 50 }
```
### 5.2 Operator Validation

Allowed operators depend on the **metric type**.

| Metric Type | Allowed Operators |
|------------|------------------|
| Numeric | `<`, `<=`, `>`, `>=`, `=`, `between` |
| Boolean | `=`, `!=` |
| Aggregates | `all`, `any`, `trend` |

Operators not compatible with the metric type are **rejected**.

---

## 6. Logical Consistency Validation

### 6.1 Conflicting Conditions

The validator detects **unsatisfiable or contradictory rules**.

**Example:**
```json
{
  "and": [
    { "field": "pe_ratio", "operator": "<", "value": 5 },
    { "field": "pe_ratio", "operator": ">", "value": 50 }
  ]
}
```

❌ **Rejected:** logically impossible

---

### 6.2 Duplicate Metric Conflicts

Multiple conditions on the **same metric** must be **logically compatible**.

**Allowed:**

```json
pe_ratio > 5 AND pe_ratio < 15
```

**Rejected:**

```json
pe_ratio < 5 AND pe_ratio > 50
```

## 7. Temporal Validation

### 7.1 Time Window Requirement

Metrics that require **time context** must explicitly include a **time window**.

**Rules:**

- Time-dependent metrics (e.g., CAGR, trends, rolling averages) **must** specify a window
- Implicit or inferred time windows are **not allowed**

**Invalid:**

```json
{ "field": "revenue_cagr", "operator": ">", "value": 10 }
```

**Valid:**

```json
{
  "field": "revenue_cagr",
  "window": { "years": 3 },
  "operator": ">",
  "value": 10
}
```

### 7.2 Window Sufficiency

**Rules:**

- Minimum required periods must exist
- Window length must be **≥ required length** for the metric

**Failure Behavior:**

- Query is **rejected**
- Validation error is returned to the caller

---

## 8. Derived Metric Safety Validation

### 8.1 Divide-by-Zero Prevention

Derived metrics are **rejected** if the denominator is ≤ 0.

| Metric | Unsafe Condition |
|------|------------------|
| PEG | EPS growth ≤ 0 |
| Debt / FCF | Free Cash Flow ≤ 0 |
| FCF Margin | Revenue ≤ 0 |

---

### 8.2 Negative Growth Handling

**Rules:**

- Growth-based metrics must **explicitly specify expected direction**
- Ambiguous growth conditions are **rejected**

**Example rejected:**

``` "positive growth" ```

## 9. Null & Missing Data Handling

### 9.1 Explicit Null Policy

Each DSL may specify:

```json
"null_handling": "exclude | fail | fallback_latest"
```

**Default behavior:**

- `exclude`

---

### 9.2 Partial Data

If some companies lack required data:

- Affected companies are **excluded**
- Query execution **continues safely** for remaining companies

This ensures robustness without compromising correctness.

---

## 10. Error Classification

Validation errors are classified as follows:

| Type | Description |
|-----|------------|
| `VALIDATION_ERROR` | User query issue (invalid DSL, unsafe logic) |
| `DATA_ERROR` | Missing or corrupt underlying data |
| `SYSTEM_ERROR` | Unexpected backend failure |

- Only `VALIDATION_ERROR` messages are exposed directly to users
- `SYSTEM_ERROR` details are never leaked

---

## 11. Validation Error Response Format
```json
{
  "success": false,
  "error_type": "VALIDATION_ERROR",
  "message": "PEG ratio cannot be computed because EPS growth is zero",
  "failing_rule": {
    "field": "peg_ratio",
    "operator": "<",
    "value": 1
  }
}
```

## 12. Validation Guarantees

This validation layer guarantees:

- No unsafe query reaches the database
- No ambiguous logic is executed
- Derived metrics are mathematically valid
- Execution results are reproducible and auditable

---

## 13. Summary

Backend validation is the **trust boundary** of the screener platform.

It ensures:

- Safety
- Explainability
- Reliability
- Production readiness





