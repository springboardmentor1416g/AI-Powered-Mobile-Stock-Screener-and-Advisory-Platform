# Screening Rule Engine Specification — Stock Screener

The rule engine uses a lightweight DSL (domain-specific language) to evaluate stock attributes
and filter them based on investor-defined screening rules.

---

## 1. DSL Object Structure (JSON)

The LLM Parser produces a JSON DSL which the Screener Engine converts to SQL.

```json
{
  "universe": {
    "exchanges": ["NSE"],
    "sectors": ["Information Technology", "Semiconductors", "Software", "Telecom"]
  },
  "filters": [
    { "field": "peg_ratio", "operator": "<", "value": 3 },
    { "field": "debt_to_fcf", "operator": "<=", "value": 4 },
    { "field": "revenue_growth_yoy", "operator": ">", "value": 0 },
    { "field": "ebitda_growth_yoy", "operator": ">", "value": 0 }
  ],
  "events": {
    "buyback_announced": true,
    "earnings_within_days": 30
  },
  "valuation": {
    "price_vs_target": "at_or_below_low"
  },
  "sort": [
    { "field": "peg_ratio", "direction": "asc" },
    { "field": "revenue_growth_yoy", "direction": "desc" }
  ],
  "limit": 100
}
