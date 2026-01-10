def parse_query(nl_query):
    if "PE < 5" in nl_query:
        return {"metric": "pe", "operator": "<", "value": 5}
    if "positive revenue growth" in nl_query:
        return {"metric": "revenue_growth", "operator": ">", "value": 0}
    return {}
