from services.llm_parser.models import DSLQuery
from services.llm_parser.exceptions import DSLValidationError

ALLOWED_FIELDS = {"pe_ratio", "market_cap", "roe"}
ALLOWED_OPERATORS = {"<", ">", "<=", ">="}

def validate_dsl(dsl: dict) -> DSLQuery:
    try:
        parsed = DSLQuery(**dsl)
    except Exception as e:
        raise DSLValidationError(str(e))

    for cond in parsed.conditions:
        if cond.field not in ALLOWED_FIELDS:
            raise DSLValidationError(f"Unsupported field: {cond.field}")
        if cond.operator not in ALLOWED_OPERATORS:
            raise DSLValidationError(f"Unsupported operator: {cond.operator}")

    return parsed
