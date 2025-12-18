from screener.exceptions import InvalidRuleError

class ScreenerCompiler:
    SUPPORTED_OPERATORS = {"<", ">", "==", ">=", "<="}

    @staticmethod
    def parse_rule(rule: str):
        """
        Parses a single rule string like "price > 100"
        Returns a dict: {"field": "price", "operator": ">", "value": 100}
        """
        try:
            field, operator, value = rule.split()
        except ValueError:
            raise InvalidRuleError(f"Malformed rule: {rule}")

        if operator not in ScreenerCompiler.SUPPORTED_OPERATORS:
            raise InvalidRuleError(f"Unsupported operator: {operator}")

        try:
            value = float(value)
        except ValueError:
            raise InvalidRuleError(f"Invalid numeric value: {value}")

        return {"field": field, "operator": operator, "value": value}
