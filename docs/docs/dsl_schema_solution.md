# DSL Schema Design for Stock Screener Rules

## Overview
This document defines a JSON-based Domain-Specific Language (DSL) used to represent
stock screener rules in a structured, safe, and machine-validated format.

The DSL acts as an intermediate layer between:
- Natural language user queries
- LLM parsing
- Backend screener engine
- SQL execution layer

## Design Goals
- Avoid ambiguous logic
- Prevent unsafe SQL generation
- Support complex financial filters
- Enable strict validation
- Allow future extensibility

## High-Level Structure
```json
{
  "filter": {
    "and": [],
    "or": [],
    "not": {}
  },
  "meta": {
    "sector": "IT",
    "exchange": "NSE"
  }
}
