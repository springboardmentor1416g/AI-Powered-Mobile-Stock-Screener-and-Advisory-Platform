# Time Window & Period Semantics

## Overview
Certain financial metrics support time-based evaluation.

---

### Period Object
```json
{
  "type": "last_n_quarters",
  "n": 4,
  "aggregation": "all"
}
```

### Supported Period Types
* `last_n_quarters`
* `last_n_years` *(future)*

### Aggregation Rules

| Aggregation | Meaning |
| :--- | :--- |
| `all` | Every period must satisfy the condition |
| `any` | At least one period satisfies the condition |
| `avg` | Average over periods |
| `sum` | Sum over periods |

### Example
Net profit must be positive in each of the last 4 quarters:

```json
{
  "field": "net_profit",
  "operator": ">",
  "value": 0,
  "period": {
    "type": "last_n_quarters",
    "n": 4,
    "aggregation": "all"
  }
}
```