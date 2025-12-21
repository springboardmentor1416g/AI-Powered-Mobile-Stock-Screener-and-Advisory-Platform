from mapping.field_mapping import FIELD_TO_COLUMN

def compile_condition(condition, params):
    field = FIELD_TO_COLUMN[condition["field"]]
    operator = condition["operator"]
    value = condition.get("value")

    if operator == "between":
        params.extend(value)
        return f"{field} BETWEEN %s AND %s"

    if operator == "in":
        placeholders = ", ".join(["%s"] * len(value))
        params.extend(value)
        return f"{field} IN ({placeholders})"

    if operator == "exists":
        return f"{field} IS NOT NULL"

    params.append(value)
    return f"{field} {operator} %s"


def walk_dsl(node, params):
    if "and" in node:
        clauses = [walk_dsl(n, params) for n in node["and"]]
        return "(" + " AND ".join(clauses) + ")"

    if "or" in node:
        clauses = [walk_dsl(n, params) for n in node["or"]]
        return "(" + " OR ".join(clauses) + ")"

    if "not" in node:
        return f"(NOT {walk_dsl(node['not'], params)})"

    return compile_condition(node, params)


def compile_dsl_to_sql(dsl):
    params = []
    where_clause = walk_dsl(dsl["filter"], params)

    sql = f"""
        SELECT symbol, company_name
        FROM stocks
        WHERE {where_clause}
    """

    return sql, params
