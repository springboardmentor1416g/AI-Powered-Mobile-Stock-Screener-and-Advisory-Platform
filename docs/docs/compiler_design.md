# Compiler Design

## Flow
DSL Input
 → Tokenizer
 → AST Builder
 → Validation Layer
 → SQL / Execution Plan

## Execution Rules
- Temporal filters resolved first
- Derived metrics computed before filtering
- Logical precedence: () > AND > OR

## Output
- Safe executable query
- Or structured validation error
