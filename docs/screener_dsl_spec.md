# Stock Screener DSL (v1)

## Purpose
A strict JSON-based DSL used between:
Natural Language → LLM Parser → DSL → Screener Compiler → SQL

This DSL is:
- Safe (no SQL injection possible)
- Deterministic (machine-validated)
- Extensible (new fields/operators later)

---

## Top-Level Structure
```json
{
  "filter": { ... },
  "meta": { "sector": "IT", "exchange": "NSE" },
  "options": { "missing_data": "reject", "limit": 50 }
}
