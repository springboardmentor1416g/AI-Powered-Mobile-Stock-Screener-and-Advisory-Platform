import json

def run_screener(dsl):
    with open("backend/data/stocks.json") as f:
        stocks = json.load(f)

    metric = dsl["metric"]
    op = dsl["operator"]
    value = dsl["value"]

    if op == "<":
        return [s for s in stocks if s.get(metric, 0) < value]
    if op == ">":
        return [s for s in stocks if s.get(metric, 0) > value]

    return []
