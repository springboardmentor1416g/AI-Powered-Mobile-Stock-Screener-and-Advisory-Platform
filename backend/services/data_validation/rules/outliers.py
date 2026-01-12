def detect_price_spike(prices):
    issues = []
    for i in range(1, len(prices)):
        prev = prices[i-1]["close"]
        curr = prices[i]["close"]
        if prev and curr and ((curr - prev) / prev) > 0.4:
            issues.append({
                "symbol": prices[i]["ticker"],
                "issue": "Price spike > 40%",
                "severity": "MEDIUM",
                "period": prices[i]["time"],
                "action": "Manual review"
            })
    return issues
