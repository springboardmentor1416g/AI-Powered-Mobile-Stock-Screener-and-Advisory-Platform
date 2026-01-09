# Derived Metrics – Definitions, Safety Rules & Execution Strategy

## 1. Purpose

This document defines the **derived financial metrics** supported by the Screener Engine and establishes:

- Canonical formulas
- Data requirements
- Safety constraints
- Execution strategy (pre-computed vs runtime)
- Validation rules to prevent unsafe or misleading results

Derived metrics enable **advanced fundamental screening** while maintaining **deterministic, auditable execution**.

---

## 2. Design Principles

All derived metrics must satisfy:

### Determinism
- Same input data → same output

### Safety
- No divide-by-zero
- No undefined growth calculations

### Auditability
- Formula and version must be traceable

### Validation First
- Derived metrics are computed **only after validation passes**

---

## 3. Supported Derived Metrics

### 3.1 Valuation Metrics

#### PEG Ratio

**Description**  
Price-to-Earnings Growth ratio

**Formula:**
```  PEG = PE Ratio / EPS Growth Rate ```

**Inputs Required**

- `pe_ratio`
- `eps_cagr` (or EPS growth over a defined window)

**Safety Rules**

- EPS growth must be **> 0**
- ❌ Reject if EPS growth is `0`, `null`, or negative

**Failure Behavior**

- Validation error (**metric unsafe**)
- Company excluded from the result set

---

### 3.2 Growth Metrics

#### EPS CAGR

**Description**  
Compound Annual Growth Rate of Earnings Per Share

**Formula:**
``` EPS CAGR = ((EPS_end / EPS_start)^(1 / years) - 1) × 100 ```

**Inputs Required**

- EPS at start period
- EPS at end period
- Time window (years)

**Safety Rules**

- `EPS_start > 0`
- Time window ≥ **2 periods**
- Missing intermediate data → fallback rule applies

---

### Revenue CAGR

**Description**  
Compound Annual Growth Rate of Revenue

**Formula:**
``` Revenue CAGR = ((Revenue_end / Revenue_start)^(1 / years) - 1) × 100 ```

**Safety Rules**

- `Revenue_start > 0`
- Time window must be **explicitly defined**

---

### 3.3 Leverage Metrics

#### Debt-to-Free-Cash-Flow

**Description**  
Measures a company’s ability to repay debt using free cash flow

**Formula:**
``` Debt / Free Cash Flow ```

**Safety Rules**

- Free Cash Flow **> 0**
- Debt **≥ 0**

**Failure Behavior**

- If `FCF ≤ 0` → metric **invalid**
- Company **excluded or flagged** (configurable)

---

### 3.4 Efficiency Metrics

#### Free Cash Flow Margin

**Formula:**
``` FCF Margin = Free Cash Flow / Revenue ```

**Safety Rules**

- Revenue **> 0**

---

### 3.5 Stability Metrics

#### Earnings Consistency Score

**Description**  
Measures the consistency of earnings over time.

**Computation Strategy**

- Count the number of periods with **positive EPS** within the defined window
- Normalize the count to a **score between 0 and 1**

**Example**

``` Consistency = positive_periods / total_periods ```

## 4. Execution Strategy

### 4.1 Pre-Computed vs Runtime Metrics

| Metric | Strategy | Reason |
|------|---------|--------|
| PE Ratio | Stored | Frequently used |
| Revenue | Stored | Base metric |
| EPS | Stored | Base metric |
| CAGR Metrics | Runtime | Time-window dependent |
| PEG | Runtime | Depends on growth |

---

### 4.2 Execution Order

1. Validate data availability  
2. Compute base metrics  
3. Compute time-window aggregates  
4. Compute derived metrics  
5. Apply logical filters  

> Derived metrics **never** run before base metrics.

---

## 5. Validation Rules (Pre-Execution)

Derived metrics are rejected if:

- Required base metrics are missing
- Denominator ≤ 0
- Time window is insufficient
- Metric is requested without required context

These checks occur in the **Validation Engine**, not in the compiler or runner.

---

## 6. Error Classification

| Error Type | Description |
|-----------|-------------|
| Validation Error | Unsafe or undefined metric |
| Data Error | Missing or corrupt data |
| System Error | Unexpected runtime failure |

- Derived metric errors are **never silently ignored**.

---

## 7. Versioning & Change Control

- Each derived metric is **versioned**
- Formula changes require a **version bump**
- Old queries always use the **original formula version**

## 8. Example DSL Usage

```json
{
  "and": [
    {
      "field": "peg_ratio",
      "operator": "<",
      "value": 1
    },
    {
      "field": "revenue_cagr",
      "window": { "years": 3 },
      "operator": ">",
      "value": 10
    }
  ]
}
```

## 9. Summary

Derived metrics enable advanced, meaningful screening while maintaining:

- Safety
- Determinism
- Transparency
- Validation guarantees

This design ensures that **no derived computation can compromise system reliability or user trust**.
