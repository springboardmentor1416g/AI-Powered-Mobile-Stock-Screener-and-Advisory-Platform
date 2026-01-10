ALLOWED_FIELDS = {"pe_ratio", "market_cap", "revenue_growth"}
ALLOWED_OPERATORS = {"<", ">", "<=", ">="}

def validate_dsl(dsl: dict):
    for condition in dsl["conditions"]:
        if condition["field"] not in ALLOWED_FIELDS:
            raise ValueError(f"Unsupported field: {condition['field']}")

        if condition["operator"] not in ALLOWED_OPERATORS:
            raise ValueError(f"Unsupported operator: {condition['operator']}")
