# Screener Compiler & Runner

This module converts validated DSL rules into executable
database queries and runs them safely.

## Flow
DSL → Compiler → SQL → Runner → Results

## Guarantees
- No SQL injection
- Logical correctness
- Nested condition support

## Not Included
- NLP
- Caching
- Alerts
