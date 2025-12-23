# LLM Interface Specification (Stub Phase)

## Endpoint
POST /api/v1/llm/translate

## Purpose
Translate a natural-language stock screener query into a structured DSL JSON.

## Request Body
```json
{
  "query": "PE less than 30 AND revenue growth greater than 10"
}

```

## Response (Success)

```json
{
  "success": true,
  "dsl": {
    "and": [
      {
        "field": "pe_ratio",
        "operator": "<",
        "value": 30
      },
      {
        "field": "revenue_growth_yoy",
        "operator": ">",
        "value": 10
      }
    ]
  }
}
```

## Response (Unsupported / Invalid)

```json
{
  "success": false,
  "error": "Unsupported query format"
}
```
## Notes
- No real LLM calls in this phase
- Deterministic, predictable output
- Provider-agnostic