# Sample Queries

### Query
"Stocks with PE ratio less than 15"

### Expected DSL
```json
{
  "conditions": [
    {
      "field": "pe_ratio",
      "operator": "<",
      "value": 15
    }
  ],
  "logical_operator": "AND",
  "timeframe": "1Y"
}
