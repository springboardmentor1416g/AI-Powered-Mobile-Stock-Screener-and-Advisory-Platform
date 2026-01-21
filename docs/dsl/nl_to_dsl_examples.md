# NL → DSL Mapping Examples

## Example 1
**Input:** PE < 5 AND promoter holding > 50

```json
{
  "filter": {
    "and": [
      { "field": "pe_ratio", "operator": "<", "value": 5 },
      { "field": "promoter_holding", "operator": ">", "value": 50 }
    ]
  }
}
