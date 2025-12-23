# LLM Stub Integration Notes

## Purpose
This document describes how the LLM Stub integrates with the existing screener pipeline
during the stub phase (no real LLM).

## Integration Flow
Natural Language Query
→ LLM Stub (`/api/v1/llm/translate`)
→ DSL JSON
→ DSL Validation
→ Screener Compiler
→ SQL Execution
→ Results

## Key Assumptions
- LLM output is deterministic and predefined
- Only supported NL patterns are accepted
- Unsupported queries fail safely
- No database execution occurs without valid DSL

## Error Handling
| Scenario | Behavior |
|-------|---------|
Unsupported NL input | 400 error returned |
Invalid DSL | Execution blocked |
Missing fields | Validation failure |

## Future Extension
- Replace stub with real LLM provider
- Add prompt engineering
- Expand DSL coverage
- Add confidence/ambiguity scoring

## Non-Goals (This Phase)
- No real LLM API calls
- No prompt tuning
- No cost or latency optimization
