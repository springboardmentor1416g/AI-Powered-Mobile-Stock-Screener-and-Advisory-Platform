# Stock Screener DSL – Specification v1.0

## Purpose
This DSL defines a strict, machine-validated contract between:
Natural Language → LLM → DSL → Screener Compiler → SQL

It prevents ambiguity, unsafe execution, and inconsistent interpretation.

---

## Top-Level Structure

```json
{
  "filter": { ... },
  "meta": {
    "sector": "IT",
    "exchange": "NSE"
  }
}
