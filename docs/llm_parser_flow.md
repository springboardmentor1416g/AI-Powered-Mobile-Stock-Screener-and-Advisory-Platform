# LLM Parser Flow Documentation

## Purpose
This document describes the end-to-end flow of how a natural-language screening query is processed by the LLM Parser service and executed by the Screener Engine.

The design enforces strict separation between:
- Natural-language interpretation
- DSL validation
- Database execution

---

## High-Level Flow

```text
Frontend (NL Query)
        ↓
LLM Parser API
        ↓
LLM Stub / LLM Provider
        ↓
Structured DSL JSON
        ↓
DSL Validator
        ↓
Screener Compiler (DSL → SQL)
        ↓
Screener Runner (Execution)
        ↓
Filtered Results
        ↓
Frontend
```

---

## Step-by-Step Flow

### 1. Natural-Language Query Intake
- Frontend sends a plain-text query
- Example: ```"PE less than 30 AND revenue growth greater than 10"```


---

### 2. LLM Invocation (Stub Phase)
- Query is routed to a mock LLM implementation
- The stub maps predefined NL patterns to fixed DSL outputs
- No external API calls are made in this phase

---

### 3. DSL Generation
The LLM returns a structured DSL object:
```json
{
"and": [
  {
    "field": "pe_ratio",
    "operator": "<",
    "value": 30
  }
]
}
```
## 4. DSL Validation

DSL is validated against strict rules:

- Allowed fields
- Allowed operators
- Valid logical structure
- Invalid DSL is rejected **before execution**

---

## 5. Screener Compilation

- DSL is converted into **parameterized SQL**
- Field-to-column mapping is applied
- Logical grouping is preserved

---

## 6. Query Execution

- Compiled query is executed via the **Screener Runner**
- Results are retrieved safely from the database (or mock source)

---

## 7. Response Construction

- Results are returned in a **structured JSON** format
- Errors are handled gracefully with **user-safe messages**

---

## Error Handling Strategy

| Stage | Failure Handling |
|------|------------------|
| NL Parsing | Reject ambiguous input |
| DSL Validation | Reject malformed DSL |
| Compilation | Abort on unsupported logic |
| Execution | Safe error response |
| Response | No internal error leakage |

---

## Design Principles Enforced

- LLM never accesses the database
- DSL acts as a security boundary
- Deterministic execution
- LLM provider agnostic
- Easy future replacement of stub with real LLM

---

## Summary

This flow ensures:

- Safe AI-assisted querying
- Auditable and deterministic execution
- Clean separation of concerns
- Production-ready architecture
