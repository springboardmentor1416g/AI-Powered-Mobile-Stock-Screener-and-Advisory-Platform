# Sample Natural-Language Queries

## Purpose
This document provides example natural-language queries and their expected DSL outputs.
These samples are used for:
- Testing
- Validation
- Documentation
- CI regression checks

---

## Supported Query Examples

### 1. Simple Valuation Filter

**Input:** ```PE less than 30```


**Expected DSL:**
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
## 2. Growth Filter

**Input:** ```Revenue growth greater than 10```

**Expected DSL:** 
```json
{
  "and": [
    {
      "field": "revenue_growth_yoy",
      "operator": ">",
      "value": 10
    }
  ]
}
```

## 3. Combined AND Query
**Input:** ```PE less than 20 AND revenue growth greater than 15```
**Expected DSL:** 
```json
{
  "and": [
    {
      "field": "pe_ratio",
      "operator": "<",
      "value": 20
    },
    {
      "field": "revenue_growth_yoy",
      "operator": ">",
      "value": 15
    }
  ]
}
```

## Unsupported Query Examples

### 1. Ambiguous Language

**Input:** ```Cheap stocks with good growth```

**Result:**  
❌ Rejected  

**Reason:**  
Ambiguous metrics and thresholds

---

### 2. Unsupported Field

**Input:** ```Market cap greater than 1 billion```

**Result:**  
❌ Rejected  

**Reason:**  
`market_cap` not supported in DSL schema

---

### 3. Non-Numeric Value

**Input:** ```PE less than high```


**Result:**  
❌ Rejected  

**Reason:**  
Non-numeric comparison value

---

## Notes

- Only deterministic queries are accepted
- Free-text interpretation is intentionally limited
- This ensures safety and predictable execution

---

## Summary

These sample queries demonstrate:

- Supported NL patterns
- Expected DSL mappings
- Safe rejection of invalid inputs
