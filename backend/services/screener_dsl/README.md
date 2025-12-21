# Screener DSL Module

This module defines a JSON-based Domain Specific Language (DSL)
for expressing stock screener rules safely.

## Responsibilities
- Define DSL structure
- Validate rule correctness
- Prevent unsafe or ambiguous queries

## Does NOT handle
- SQL generation
- API routing
- Frontend logic

## Flow
Natural Language → LLM → DSL → Compiler → SQL
