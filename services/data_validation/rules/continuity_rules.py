def check_quarter_continuity(symbol, data):
    issues = []

    quarters = [d["date"] for d in data]
    quarters_sorted = sorted(quarters)

    for i in range(len(quarters_sorted) - 1):
        curr_year, curr_q = quarters_sorted[i].split("-Q")
        next_year, next_q = quarters_sorted[i+1].split("-Q")

        curr_q = int(curr_q)
        next_q = int(next_q)

        if (next_year == curr_year and next_q != curr_q + 1) and not (curr_q == 4 and next_q == 1):
            issues.append({
                "issue": "Quarter continuity break",
                "severity": "HIGH",
                "period": quarters_sorted[i],
                "action": "Check missing quarters"
            })

    return issues
