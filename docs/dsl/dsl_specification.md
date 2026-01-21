# Stock Screener DSL Specification

## Purpose
This DSL defines a strict, JSON-based rule format used to convert
natural language stock screening queries into deterministic logic.

The DSL acts as a safe contract between:
User Query → LLM Parser → Screener Engine → SQL

## Design Principles
- Strict JSON only
- No raw SQL
- Deterministic execution
- Fully validatable
- Extensible for future metrics
