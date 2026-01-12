def check_missing_revenue(records):
    issues = []
    for r in records:
        if r["revenue"] is None:
            issues.append({
                "symbol": r["ticker"],
                "issue": "Missing revenue",
                "severity": "HIGH",
                "period": r["quarter"],
                "action": "Impute or skip"
            })
    return issues
