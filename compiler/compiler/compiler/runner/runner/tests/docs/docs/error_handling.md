# Error Handling Strategy

- Invalid DSL fields → Rejected before execution
- Unsupported operators → Compiler error
- Empty result sets → Return empty list
- Database errors → Logged and wrapped safely
