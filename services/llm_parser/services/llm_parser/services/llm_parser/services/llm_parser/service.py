from .llm_client import parse_nl_to_dsl
from .dsl_validator import validate_dsl

def process_nl_query(nl_query: str):
    dsl = parse_nl_to_dsl(nl_query)
    validate_dsl(dsl)

    # Forward DSL to screener engine (mocked)
    return {
        "status": "success",
        "dsl": dsl,
        "results": []  # Screener output placeholder
    }
