
# DSL Validation Rules

All DSL queries must be validated before execution.

---

## Mandatory Checks
✔ Field exists in field catalog  
✔ Operator is valid for field type  
✔ Numeric fields accept numeric values only  
✔ Period rules allowed only for time-series metrics  
✔ One logical operator per filter node  

---

## Rejection Conditions
❌ Empty filters  
❌ Unknown fields  
❌ SQL-like expressions  
❌ Invalid operator combinations  
❌ Period logic on non-time-series fields  

---

## Security Guarantees
- No SQL injection possible
- No function execution
- No arbitrary expressions
