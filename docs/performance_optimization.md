## Performance & Indexing Plan

### Indexes
- B-tree index on ticker fields
- Composite index on (ticker, time) for price_history

### Time-Series Optimization
- price_history uses TimescaleDB hypertable
- Chunked by time for efficient scans

### Future Improvements
- Materialized views for dashboards
- Read replicas for analytics
