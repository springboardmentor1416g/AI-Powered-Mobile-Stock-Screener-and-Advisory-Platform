MANDATORY_METRICS = ["revenue", "ebitda", "eps"]
OPTIONAL_METRICS = ["analyst_estimate", "dividend"]


def check_missing_data(data: dict):
    """
    Checks for missing mandatory & optional data
    :param data: Company data dictionary
    :return: list of issues
    """

    issues = []

    quarters = data.get("quarters", [])

    # -----------------------------
    # Check missing quarters
    # -----------------------------
    if not quarters or len(quarters) == 0:
        issues.append({
            "type": "MISSING_QUARTERS",
            "severity": "HIGH",
            "message": "No quarterly data available"
        })
        return issues

    # -----------------------------
    # Check mandatory metrics
    # -----------------------------
    for metric in MANDATORY_METRICS:
        values = data.get(metric, [])

        for idx, quarter in enumerate(quarters):
            # If metric list shorter than quarters OR value is None
            if idx >= len(values) or values[idx] is None:
                issues.append({
                    "type": "MISSING_MANDATORY_METRIC",
                    "severity": "HIGH",
                    "message": f"Missing {metric.upper()} for {quarter}",
                    "metric": metric,
                    "quarter": quarter
                })

    # -----------------------------
    # Check optional metrics
    # -----------------------------
    for metric in OPTIONAL_METRICS:
        values = data.get(metric, [])

        for idx, quarter in enumerate(quarters):
            if idx >= len(values) or values[idx] is None:
                issues.append({
                    "type": "MISSING_OPTIONAL_METRIC",
                    "severity": "MEDIUM",
                    "message": f"Missing optional metric {metric.upper()} for {quarter}",
                    "metric": metric,
                    "quarter": quarter
                })

    return issues
