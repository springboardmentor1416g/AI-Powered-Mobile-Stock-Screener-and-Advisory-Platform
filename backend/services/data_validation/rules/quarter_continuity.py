from datetime import datetime

def validate_quarter_continuity(quarter_dates):
    """
    quarter_dates: list of quarter end dates as strings (YYYY-MM-DD)

    Example:
    ["2023-03-31", "2023-06-30", "2023-09-30", "2023-12-31"]
    """

    issues = []
    parsed_dates = []

    # -------------------------------
    # 1️⃣ Parse & validate dates
    # -------------------------------
    for q in quarter_dates:
        try:
            parsed_dates.append(datetime.strptime(q, "%Y-%m-%d"))
        except ValueError:
            issues.append({
                "rule": "Invalid date format",
                "severity": "HIGH",
                "value": q
            })

    if issues:
        return {
            "valid": False,
            "manual_review_required": True,
            "issues": issues
        }

    # Sort dates
    parsed_dates.sort()

    # -------------------------------
    # 2️⃣ No future quarters
    # -------------------------------
    today = datetime.today()
    for date in parsed_dates:
        if date > today:
            issues.append({
                "rule": "Future quarter date found",
                "severity": "HIGH",
                "value": date.strftime("%Y-%m-%d")
            })

    # -------------------------------
    # 3️⃣ No duplicate quarters
    # -------------------------------
    if len(parsed_dates) != len(set(parsed_dates)):
        issues.append({
            "rule": "Duplicate quarter detected",
            "severity": "HIGH",
            "value": "Duplicate quarter dates present"
        })

    # -------------------------------
    # 4️⃣ Quarter gap check (3 months)
    # -------------------------------
    for i in range(1, len(parsed_dates)):
        months_diff = (
            (parsed_dates[i].year - parsed_dates[i - 1].year) * 12 +
            (parsed_dates[i].month - parsed_dates[i - 1].month)
        )

        if months_diff != 3:
            issues.append({
                "rule": "Invalid quarter gap",
                "severity": "HIGH",
                "value": f"{parsed_dates[i - 1].strftime('%Y-%m-%d')} → {parsed_dates[i].strftime('%Y-%m-%d')}"
            })

    # -------------------------------
    # Final Result
    # -------------------------------
    if issues:
        return {
            "valid": False,
            "manual_review_required": True,
            "issues": issues
        }

    return {
        "valid": True,
        "manual_review_required": False,
        "issues": []
    }
