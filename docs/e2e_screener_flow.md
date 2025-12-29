# End-to-End NL Screener Flow (M2)

## Flow Overview

1. User enters natural-language query in mobile app
2. Frontend sends query to backend API
3. Backend routes query to LLM Parser
4. LLM Stub converts NL → DSL
5. DSL is validated against schema
6. Screener engine executes validated logic
7. Filtered results returned to frontend
8. Results rendered in Results View

## Safety Guarantees
- LLM output never accesses DB directly
- Only validated DSL is executed
- Invalid queries are rejected safely

## Assumptions
- LLM stub used instead of real LLM
- Screener results are mocked for M2
