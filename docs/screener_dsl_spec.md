# Stock Screener DSL Specification

## 1. Purpose
This document defines a JSON-based DSL (Domain Specific Language) used to describe
stock screening rules in a safe and structured way.

The DSL acts as a bridge between:
User Natural Language → LLM → DSL → Screener Engine → SQL

This layer prevents unsafe queries, ambiguity, and SQL injection.

---

## 2. High Level Structure

```json 
{
  "filter": {},
  "meta": {}
}

{
  "filter": {
    "and": [
      { "field": "pe_ratio", "operator": "<", "value": 10 },
      { "field": "roe", "operator": ">", "value": 15 }
    ]
  }
}

{
  "field": "pe_ratio",
  "operator": "<",
  "value": 5
}

{
  "field": "pe_ratio",
  "operator": "between",
  "value": [5, 15]
}

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

{
  "field": "peg_ratio",
  "operator": "<",
  "value": 3,
  "derived_from": ["pe_ratio", "eps_growth"]
}

{
  "filter": {
    "and": [
      { "field": "pe_ratio", "operator": "<", "value": 5 },
      { "field": "promoter_holding", "operator": ">", "value": 50 },
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
    ]
  }
}
