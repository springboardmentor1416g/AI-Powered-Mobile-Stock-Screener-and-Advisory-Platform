MAX_NESTING_DEPTH = 5

def validate_rule_depth(rule: dict, depth: int = 0):
    if depth > MAX_NESTING_DEPTH:
        raise ValueError("Rule nesting depth exceeded")

    if rule["type"] == "group":
        for condition in rule.get("conditions", []):
            validate_rule_depth(condition, depth + 1)
