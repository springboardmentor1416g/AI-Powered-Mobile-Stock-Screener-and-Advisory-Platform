# Performance & Indexing Strategy

This document describes performance optimizations for the
AI-Powered Mobile Stock Screener & Advisory Platform database.

## Indexing Strategy
- B-tree indexes on `ticker` fields for fast filtering
- Composite index on `(ticker, time)` in price_history
- Partial index for recent price queries (last 1 year)

## Time-Series Optimization
- TimescaleDB hypertables used for price_history
- Chunking based on time for efficient scans
- Compression can be enabled for older historical data

## Query Optimization
- Frequently used screener filters indexed
- Avoid full table scans on large time-series data
- Use materialized views for heavy aggregations

## Scalability
- Read replicas supported for analytics
- Connection pooling recommended (pgBouncer)