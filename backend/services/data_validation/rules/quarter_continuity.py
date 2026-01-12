def check_quarter_gaps(quarters, ticker):
    issues = []
    quarters = sorted(quarters)
    for i in range(1, len(quarters)):
        if (quarters[i] - quarters[i-1]).days > 120:
            issues.append({
                "symbol": ticker,
                "issue": "Missing quarter gap",
                "severity": "HIGH",
                "period": quarters[i],
                "action": "Skip company"
            })
    return issues
