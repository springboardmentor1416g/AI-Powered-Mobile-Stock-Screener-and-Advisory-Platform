# DSL Specification v2

## Temporal Conditions
- positive earnings last 4 quarters
- revenue_growth > 10% for last 3 years
- EPS increasing QoQ for last N periods

## Syntax Examples
VALID:
EPS > 0 FOR LAST 4 QUARTERS
PE BETWEEN 5 AND 15
ALL(EPS > 0, REVENUE_GROWTH > 10%)

INVALID:
EPS > 0 (missing time window)
PE < 5 AND PE > 50

## Logical Operators
- AND, OR
- Nested parentheses supported

## Range Expressions
- BETWEEN a AND b
- Inclusive / Exclusive bounds

## Null Handling
- IGNORE_IF_NULL
- FAIL_IF_NULL
- USE_LATEST_AVAILABLE
