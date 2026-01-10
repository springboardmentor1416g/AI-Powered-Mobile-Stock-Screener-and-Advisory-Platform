# LLM Integration Interface Specification

## Endpoint
POST /api/llm/translate

## Description
Accepts a natural language stock screening query and returns a structured DSL JSON.

## Request Schema
```json
{
  "query": "string"
}
