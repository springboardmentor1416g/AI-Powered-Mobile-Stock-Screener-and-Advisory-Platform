def detect_outliers(symbol, data):
    issues = []
    
    revenues = [d["revenue"] for d in data if isinstance(d.get("revenue"), (int, float))]
    if not revenues:
        return issues

    mean_val = sum(revenues) / len(revenues)
    std = (sum((x - mean_val) ** 2 for x in revenues) / len(revenues)) ** 0.5

    for entry in data:
        rev = entry.get("revenue")
        if isinstance(rev, (int, float)):
            if rev > mean_val + 4 * std or rev < mean_val - 4 * std:
                issues.append({
                    "issue": "Revenue outlier detected",
                    "severity": "MEDIUM",
                    "period": entry["date"],
                    "action": "Manual review"
                })

    return issues
