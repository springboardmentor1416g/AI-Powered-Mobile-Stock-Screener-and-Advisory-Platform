import os
import csv
from datetime import datetime
from backend.services.data_validation.rules.missing_data import check_missing_revenue

import logging

logging.basicConfig(
    filename="logs/validation.log",
    level=logging.INFO
)

def run_validation():
    logging.warning(f"{issue['symbol']} - {issue['issue']}")
    # Dummy example records (replace later with DB fetch)
    fundamentals = [
        {"ticker": "TCS", "quarter": "2024-Q2", "revenue": None},
        {"ticker": "INFY", "quarter": "2024-Q2", "revenue": 25000}
    ]

    issues = []
    issues.extend(check_missing_revenue(fundamentals))

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Write CSV report
    with open(f"backend/services/data_validation/reports/validation_summary_{timestamp}.csv", "w", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["symbol", "issue", "severity", "period", "action"]
        )
        writer.writeheader()
        for issue in issues:
            writer.writerow(issue)

    # Write Markdown report
    with open(f"backend/services/data_validation/reports/validation_summary_{timestamp}.md", "w") as f:
        for issue in issues:
            f.write(
                f"- **{issue['symbol']}** | {issue['issue']} | "
                f"{issue['severity']} | {issue['action']}\n"
            )

    print("Validation complete")

if __name__ == "__main__":
    run_validation()
