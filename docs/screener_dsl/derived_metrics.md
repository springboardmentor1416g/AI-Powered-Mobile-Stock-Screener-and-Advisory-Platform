# Derived Metrics in DSL

## Overview
Derived metrics represent indicators calculated from base metrics.

---

### Representation
```json
{
  "field": "peg_ratio",
  "operator": "<",
  "value": 3,
  "derived_from": ["pe_ratio", "eps_growth"]
}
```

### Rules
* Derived metrics must be explicitly whitelisted.
* May be precomputed or calculated at query time.
* Cannot reference raw SQL expressions.

### Supported Derived Metrics (v1)
* `peg_ratio`
* `debt_to_fcf`