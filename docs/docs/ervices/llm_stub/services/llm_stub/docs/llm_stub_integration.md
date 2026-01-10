# LLM Stub Integration Notes

## Flow
1. Frontend sends NL query
2. Backend calls LLMStub.translate()
3. DSL JSON returned
4. DSL validated against schema
5. Screener compiler converts DSL → SQL
6. Query executed safely

## Error Handling
- Unsupported queries return error
- No SQL execution on failure
- Schema validation mandatory

## Assumptions
- DSL schema already finalized
- Screener compiler unchanged
