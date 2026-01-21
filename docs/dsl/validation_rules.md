# DSL Validation Rules

## Accepted
- Field exists in field catalog
- Operator compatible with field type
- Numeric fields use numeric values
- Period rules only for time-series fields

## Rejected
- Unknown fields
- Empty filters
- Conflicting operators
- Raw SQL or functions
- Free-text logic
