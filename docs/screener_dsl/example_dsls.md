# Example DSL Queries

## Simple Valuation Filter
```json
{
  "filter": {
    "and": [
      { "field": "pe_ratio", "operator": "<", "value": 10 }
    ]
  }
}
```

## Complex Multi-Condition Filter
```json
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
```