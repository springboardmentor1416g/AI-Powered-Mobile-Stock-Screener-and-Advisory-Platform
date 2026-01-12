import os

USE_LLM = os.getenv("USE_LLM", "false").lower() == "true"

def parse_nl_to_dsl(nl_query: str) -> dict:
    if not nl_query:
        raise ValueError("Empty query")

    return {
        "universe": "NSE",
        "conditions": [
            {"field": "pe_ratio", "operator": "<", "value": 20},
            {"field": "market_cap", "operator": ">", "value": 1000}
        ],
        "sort_by": "market_cap",
        "limit": 20
    }
