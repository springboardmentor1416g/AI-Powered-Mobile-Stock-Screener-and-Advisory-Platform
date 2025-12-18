from sqlalchemy import and_, or_
from screener.field_mapping import DSL_FIELD_MAP
from screener.exceptions import (
    UnsupportedFieldError,
    UnsupportedOperatorError,
    InvalidRuleError,
)

OPERATOR_MAP = {
    ">": lambda col, val: col > val,
    "<": lambda col, val: col < val,
    ">=": lambda col, val: col >= val,
    "<=": lambda col, val: col <= val,
    "==": lambda col, val: col == val,
    "!=": lambda col, val: col != val,
}

class ScreenerCompiler:
    """
    Translates validated DSL into SQLAlchemy expressions
    """

    def compile(self, rule: dict):
        rule_type = rule.get("type")

        if rule_type == "condition":
            return self._compile_condition(rule)
        elif rule_type == "group":
            return self._compile_group(rule)
        else:
            raise InvalidRuleError(f"Unknown rule type: {rule_type}")

    def _compile_condition(self, rule: dict):
        field = rule["field"]
        operator = rule["operator"]
        value = rule["value"]

        if field not in DSL_FIELD_MAP:
            raise UnsupportedFieldError(field)

        if operator not in OPERATOR_MAP:
            raise UnsupportedOperatorError(operator)

        column = DSL_FIELD_MAP[field]
        return OPERATOR_MAP[operator](column, value)

    def _compile_group(self, rule: dict):
        logical_op = rule["operator"]
        conditions = rule.get("conditions", [])

        compiled = [self.compile(c) for c in conditions]

        if logical_op == "AND":
            return and_(*compiled)
        elif logical_op == "OR":
            return or_(*compiled)
        else:
            raise UnsupportedOperatorError(logical_op)
