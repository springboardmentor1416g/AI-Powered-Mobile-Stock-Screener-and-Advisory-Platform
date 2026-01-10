from compiler.field_mapper import map_field

class RuleCompiler:
    def compile(self, rule):
        sql, params = self._compile_rule(rule)
        return sql, params

    def _compile_rule(self, rule):
        if "operator" in rule:
            clauses = []
            params = []

            for r in rule["rules"]:
                clause, p = self._compile_rule(r)
                clauses.append(clause)
                params.extend(p)

            joiner = f" {rule['operator']} "
            return f"({joiner.join(clauses)})", params

        field = map_field(rule["field"])
        operator = rule["comparison"]
        value = rule["value"]

        return f"{field} {operator} %s", [value]
