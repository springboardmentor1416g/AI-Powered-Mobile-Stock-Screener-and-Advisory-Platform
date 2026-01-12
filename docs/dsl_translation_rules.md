
### Contents (keep it tight)
```md
# NL → DSL Translation Rules

## Supported Metrics
- revenue_growth
- net_profit_margin
- pe_ratio

## Operators
- "greater than", "above", ">" → >
- "less than", "below", "<" → <

## Time Periods
- "last 4 quarters" → period: "4q"
- "last year" → period: "1y"

## Logical Conditions
- "and" → AND
- "or" → OR

## Rejections
- Predictions
- Advice ("best stock")
- Vague terms ("good growth")
