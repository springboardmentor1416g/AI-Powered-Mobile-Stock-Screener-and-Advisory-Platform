## Stock Screener DSL – Specification

### Purpose
This document defines the JSON-based Domain Specific Language (DSL) used to represent stock screener rules in a safe, structured, and machine-validated format.

The DSL acts as an intermediate layer between:
**Natural Language → LLM → DSL → Screener Compiler → SQL**

### Design Principles
* Strict JSON schema
* Deterministic and unambiguous
* No raw SQL or functions
* Composable logic
* Extensible for future indicators

---

### Top-Level Structure

```json
{
  "filter": { },
  "meta": { }
}
```

* **`filter`**: Defines logical conditions.
* **`meta`** *(optional)*: Used for dataset scoping.

**Example Meta Object:**
```json
{
  "sector": "IT",
  "exchange": "NSE"
}
```

---

### Logical Operators
Each filter node allows only one logical operator. Nested logic is fully supported.

**AND**
```json
{ "and": [ <condition>, <condition> ] }
```

**OR**
```json
{ "or": [ <condition>, <condition> ] }
```

**NOT**
```json
{ "not": <condition> }
```

---

### Condition Object

```json
{
  "field": "pe_ratio",
  "operator": "<",
  "value": 25
}
```

### Supported Operators

| Operator | Meaning |
| :--- | :--- |
| `<` | Less than |
| `>` | Greater than |
| `<=` | Less than or equal |
| `>=` | Greater than or equal |
| `=` | Equals |
| `!=` | Not equals |
| `between` | Range |
| `in` | Set membership |
| `exists` | Non-null check |