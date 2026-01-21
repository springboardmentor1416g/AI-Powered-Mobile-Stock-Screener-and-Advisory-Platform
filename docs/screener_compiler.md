# Screener Compiler & Runner

## Purpose
Convert validated DSL rules into safe database queries.

## Flow
DSL → Compiler → SQL (parameterized) → Runner → Results

## Supported Logic
- AND / OR
- Nested conditions
- Basic comparison operators

## Safety
- Parameterized queries
- Field whitelisting
- No raw SQL
