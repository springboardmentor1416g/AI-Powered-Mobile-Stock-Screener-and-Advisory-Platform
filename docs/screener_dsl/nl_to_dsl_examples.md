# Natural Language to DSL Mapping Examples

## Example 1
**Input:**
`PE < 5 AND promoter holding > 50`

**DSL:**
```json
{
  "filter": {
    "and": [
      { "field": "pe_ratio", "operator": "<", "value": 5 },
      { "field": "promoter_holding", "operator": ">", "value": 50 }
    ]
  }
}
```

## Example 2
**Input:**
`Companies with positive earnings in last 4 quarters`

**DSL:**
```json
{
  "filter": {
    "and": [
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
