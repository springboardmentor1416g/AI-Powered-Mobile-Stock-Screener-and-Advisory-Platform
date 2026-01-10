def parse_nl_to_dsl(nl_query: str) -> dict:
    """
    Stubbed LLM response
    """
    return {
        "conditions": [
            {
                "field": "pe_ratio",
                "operator": "<",
                "value": 15
            }
        ],
        "logical_operator": "AND",
        "timeframe": "1Y"
    }
