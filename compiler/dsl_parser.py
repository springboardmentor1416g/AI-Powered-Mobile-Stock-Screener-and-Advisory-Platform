class DSLParser:
    def parse(self, rule):
        if "condition" in rule:
            return rule["condition"]

        if "operator" in rule:
            return {
                "operator": rule["operator"],
                "rules": [self.parse(r) for r in rule["rules"]]
            }

        raise ValueError("Invalid DSL rule format")
