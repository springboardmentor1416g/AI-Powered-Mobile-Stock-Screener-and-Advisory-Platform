
# NL → DSL Translation Rules (Stub)

## Supported Metrics
| NL Phrase              | DSL Field              |
|------------------------|------------------------|
| PE, P/E, price to earn | pe_ratio               |
| revenue growth         | revenue_growth_yoy     |

## Supported Operators
| NL Phrase        | DSL Operator |
|------------------|--------------|
| less than        | <            |
| greater than     | >            |
| equal to         | =            |

## Logical Keywords
| NL Keyword | DSL |
|-----------|-----|
| AND       | and |
| OR        | or  |

## Example
NL: ``` PE less than 30 AND revenue growth greater than 10```


DSL:
```json
{
  "and": [
    { "field": "pe_ratio", "operator": "<", "value": 30 },
    { "field": "revenue_growth_yoy", "operator": ">", "value": 10 }
  ]
}

```
## Unsupported Inputs

- Free text explanations
- Forecasting or opinions
- Time-series conditions (future work)
