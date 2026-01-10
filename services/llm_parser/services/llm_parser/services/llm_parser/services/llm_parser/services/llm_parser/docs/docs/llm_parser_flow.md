# LLM Parser Flow

1. User submits natural language query
2. Backend sends query to LLM or stub
3. LLM returns structured DSL JSON
4. DSL is validated against schema
5. Valid DSL forwarded to screener engine
6. Results returned to frontend
