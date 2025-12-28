class ScreenerRunner:
    @staticmethod
    def execute_rule(stock_data, compiled_rule):
        """
        Executes a compiled rule on a single stock record.
        stock_data: dict of stock attributes
        compiled_rule: dict returned by ScreenerCompiler.parse_rule
        """
        field = compiled_rule["field"]
        operator = compiled_rule["operator"]
        value = compiled_rule["value"]

        stock_value = stock_data.get(field)
        if stock_value is None:
            return False

        if operator == ">":
            return stock_value > value
        elif operator == "<":
            return stock_value < value
        elif operator == "==":
            return stock_value == value
        elif operator == ">=":
            return stock_value >= value
        elif operator == "<=":
            return stock_value <= value
        else:
            return False
