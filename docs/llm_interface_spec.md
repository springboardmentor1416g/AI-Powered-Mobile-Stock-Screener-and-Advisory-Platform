# LLM Integration Interface (NL → DSL)

## Endpoint
POST /api/llm/translate

## Request
```json
{
  "query": "stocks with revenue growth > 10% last 4 quarters"
}

Response (Success)
{
  "dsl": {
    "filters": [
      {
        "metric": "revenue_growth",
        "operator": ">",
        "value": 10,
        "period": "4q"
      }
    ],
    "logic": "AND"
  }
}

Response (Error)
{
  "error": "UNSUPPORTED_QUERY"
}

Notes

Provider-agnostic

Deterministic output

DSL must pass schema validation


✅ Done when this doc exists.

---

## 🧠 STEP 2: Define NL → DSL Translation Rules

### What to do
Document **how English maps to DSL**.

### Action
Create: