def validate_schema(symbol, data):
    issues = []

    for entry in data:
        if not entry.get("date"):
            issues.append({
                "issue": "Invalid or missing date",
                "severity": "HIGH",
                "period": "Unknown",
                "action": "Fix format"
            })

        for field, val in entry.items():
            if isinstance(val, str) and any(c in val for c in "!@#$%^&*()"):
                issues.append({
                    "issue": f"Invalid characters in {field}",
                    "severity": "MEDIUM",
                    "period": entry["date"],
                    "action": "Clean field"
                })

    return issues
