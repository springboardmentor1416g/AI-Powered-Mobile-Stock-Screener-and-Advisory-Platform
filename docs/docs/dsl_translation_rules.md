
---

#  NL → DSL Translation Rules  
 **File:** `/docs/dsl_translation_rules.md`

```md
# NL to DSL Translation Rules

## Supported Metrics
- revenue
- net_profit
- pe_ratio
- market_cap

## Comparison Operators
- greater than → ">"
- less than → "<"
- equal to → "="

## Logical Operators
- AND → "and"
- OR → "or"

## Time Constraints
- "last N quarters" → "period": { "type": "quarter", "value": N }

## Example
NL Query:
"Companies with revenue greater than 1000 and PE ratio less than 20"

DSL Output:
```json
{
  "conditions": [
    { "field": "revenue", "operator": ">", "value": 1000 },
    { "field": "pe_ratio", "operator": "<", "value": 20 }
  ],
  "logic": "and"
}

