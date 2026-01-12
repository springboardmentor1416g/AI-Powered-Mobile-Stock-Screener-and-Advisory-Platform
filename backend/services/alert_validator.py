SUPPORTED_METRICS = {"price", "peg", "debt_to_fcf"}

def validate_alert_condition(condition: dict):
    if "metric" not in condition or "operator" not in condition:
        raise ValueError("Invalid alert rule")

    if condition["metric"] not in SUPPORTED_METRICS:
        raise ValueError("Unsupported metric")
