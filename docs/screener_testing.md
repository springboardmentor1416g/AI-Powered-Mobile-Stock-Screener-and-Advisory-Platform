# Screener Engine Unit Testing

## Purpose
This document describes unit testing for the Screener Compiler and Runner.

## Covered Areas
- DSL parsing and validation
- SQL generation correctness
- Execution logic using deterministic fake data
- Error and edge-case handling

## Testing Strategy
- Compiler tests validate SQL structure and parameters
- Runner tests validate filtering behavior
- No real database is used in unit tests

## Execution
Run all tests using:
```
npx jest screener_engine/tests
```


## CI Readiness
Tests are deterministic and suitable for CI pipelines.
