# DSL Validation Rules

## Purpose
Validation ensures that only safe, meaningful, and executable screener rules
are accepted by the system.

## Validation Rules

### Field Validation
- Field must exist in predefined whitelist
- Unsupported or unknown fields are rejected

### Operator Validation
- Operator must be compatible with field type
- Numeric operators apply only to numeric fields

### Value Validation
- Numeric fields accept only numbers
- String fields accept only strings
- Empty values are not allowed

### Period Validation
- Period logic allowed only for time-series fields
- `n` must be a positive integer
- Aggregation must be one of: all, any, avg, sum

### Logical Structure Rules
- Only one logical operator per node
- Empty filters are rejected
- Deep nesting is allowed but must remain valid JSON

## Rejected Examples
- Missing field name
- Unsupported operator
- Period used on non-time-series data
- Ambiguous or empty filters

## Acceptance Criteria
- DSL supports simple and complex queries
- Time-based financial screening is possible
- Output is SQL-injection safe
- Schema is extensible for future indicators
