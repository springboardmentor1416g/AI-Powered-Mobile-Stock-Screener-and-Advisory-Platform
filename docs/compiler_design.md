# Compiler Design – Extended DSL Execution Engine (v2)

## 1. Purpose

This document describes the design and execution flow of the **Screener DSL Compiler (v2)**, which translates validated DSL rules into safe, deterministic query execution logic.

The compiler is a **pure translation and orchestration layer**. It does **not**:

- Parse natural language
- Validate business logic
- Access the database directly

Its responsibility is to:

- Accept a validated DSL
- Convert it into executable query instructions
- Ensure correct execution order and precedence
- Forward execution safely to the runner layer

---

## 2. Position in the Architecture
```
Frontend (NL Query)
        ↓
LLM / Stub
        ↓
DSL (JSON)
        ↓
Validation Engine  
        ↓
DSL Compiler       
        ↓
Execution Runner
        ↓
Database / Engine
        ↓
Results
```
**Key Principle:**  
The compiler **never executes unvalidated DSL**.

---

## 3. Compiler Responsibilities

### 3.1 Input

**Fully validated DSL JSON**

Guaranteed to be:

- Structurally correct
- Logically consistent
- Metric-safe
- Time-window explicit

---

### 3.2 Output

A **compiled execution plan**, **not raw SQL**.

**Example (conceptual):**
```json
{
  "filters": [...],
  "derived_metrics": [...],
  "time_windows": [...],
  "execution_order": [...]
}
```
## 4. DSL Translation Strategy

### 4.1 Logical Expressions

DSL supports **nested logical expressions**.
```json
{
  "and": [
    { "field": "pe_ratio", "operator": "<", "value": 20 },
    {
      "or": [
        { "field": "revenue_cagr", "operator": ">", "value": 10 },
        { "field": "eps_cagr", "operator": ">", "value": 8 }
      ]
    }
  ]
}
```
### Compiler Behavior

The compiler:

- Recursively walks the logical tree
- Preserves logical precedence
- Flattens only where safe
- Emits grouped execution instructions

---

### 4.2 Time Window Conditions

**Example DSL:**

```json
{
  "field": "revenue",
  "aggregation": "cagr",
  "window": { "type": "years", "length": 3 },
  "operator": ">",
  "value": 10
}
```
### Compiler Responsibilities

The compiler converts window definitions into:

- Windowed execution constraints
- Required data availability checks
- Deferred time-series calculations (handled by the runner)

---

### 4.3 Range Expressions

**Example:**
```json
{
  "field": "pe_ratio",
  "between": [5, 15]
}
```
Compiler expands this into:
``` pe_ratio >= 5 AND pe_ratio <= 15 ```

Execution remains atomic and deterministic.

## 5. Derived Metrics Handling

### 5.1 Registration, Not Execution

Derived metrics (PEG, CAGR, Debt-to-FCF) are:

- Registered in the compiler
- Validated before use
- Executed **only if explicitly requested**

The compiler:

- Detects required derived metrics
- Orders their computation
- Ensures no divide-by-zero or invalid denominator cases

---

### 5.2 Execution Order

Derived metrics are always computed **after base metrics**:

1. Base metrics (PE, Revenue, EPS)
2. Time-window aggregation
3. Derived metrics
4. Logical filtering

This avoids circular dependencies.

---

## 6. Execution Plan Construction

The compiler produces an **execution plan**, not raw SQL.

**Example execution plan (conceptual):**
```json
{
  "required_fields": ["pe_ratio", "revenue", "eps"],
  "derived_metrics": ["peg_ratio"],
  "filters": [
    { "metric": "pe_ratio", "op": "<", "value": 20 },
    { "metric": "peg_ratio", "op": "<", "value": 1 }
  ],
  "window_requirements": [
    { "metric": "revenue", "years": 3 }
  ]
}
```
This plan is passed to the runner.

## 7. Error Propagation Rules

The compiler does **not** generate user-facing errors.

**Error behavior:**

- Validation errors → Thrown **before** the compiler
- Execution errors → Surfaced by the **runner**
- Compiler errors → Treated as **system errors**

Compiler errors indicate:

- Invalid internal state
- Unexpected DSL structure (should not occur post-validation)

---

## 8. Safety Guarantees

The compiler guarantees:

- No raw SQL injection
- No unsafe arithmetic
- No ambiguous execution order
- No implicit assumptions
- No silent fallback behavior

All ambiguity **must be resolved before compilation**.

---

## 9. Versioning & Extensibility

The compiler is versioned **independently** of:

- LLM behavior
- DSL schema evolution
- Database schema changes

**Future extensions:**

- Query cost estimation
- Explainable execution plans
- Partial execution previews

---

## 10. Summary

The **DSL Compiler v2** is a deterministic, auditable, safety-first translation layer.

It ensures that:

- Only validated logic executes
- Derived metrics are computed safely
- Execution order is predictable
- The system remains LLM-agnostic

This design enables **production-grade screening logic** while remaining extensible for future advisory features.



