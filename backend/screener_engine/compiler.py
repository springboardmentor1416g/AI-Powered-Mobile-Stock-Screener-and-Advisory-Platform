ALLOWED_FIELDS = {
    "pe_ratio",
    "promoter_holding",
    "net_profit",
    "revenue",
    "close_price"
}

ALLOWED_OPERATORS = {
    ">", "<", ">=", "<=", "=", "!="
}

def compile_condition(condition, params):
    field = condition.get("field")
    operator = condition.get("operator")
    value = condition.get("value")

    if field not in ALLOWED_FIELDS:
        raise ValueError(f"Unsupported field: {field}")

    if operator not in ALLOWED_OPERATORS:
        raise ValueError(f"Unsupported operator: {operator}")

    sql_op = operator
    params.append(value)

    return f"{field} {sql_op} %s"


def compile_filter(filter_block, params):
    if "and" in filter_block:
        clauses = [
            compile_filter(c, params) for c in filter_block["and"]
        ]
        return "(" + " AND ".join(clauses) + ")"

    if "or" in filter_block:
        clauses = [
            compile_filter(c, params) for c in filter_block["or"]
        ]
        return "(" + " OR ".join(clauses) + ")"

    return compile_condition(filter_block, params)


def compile_dsl(dsl):
    params = []
    where_clause = compile_filter(dsl["filter"], params)
    return where_clause, params
