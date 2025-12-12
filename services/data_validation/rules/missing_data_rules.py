def check_missing_metrics(symbol, data):
    issues = []
    mandatory = ["revenue", "eps", "net_income"]

    for entry in data:
        for m in mandatory:
            if entry.get(m) is None:
                issues.append({
                    "issue": f"Missing {m}",
                    "severity": "HIGH",
                    "period": entry.get("date"),
                    "action": "Impute or request re-fetch"
                })

    return issues
