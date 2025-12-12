import os
import csv
from datetime import datetime

from rules.missing_data_rules import check_missing_metrics
from rules.outlier_rules import detect_outliers
from rules.continuity_rules import check_quarter_continuity
from rules.schema_rules import validate_schema

LOG_DIR = "services/data_validation/logs/"
REPORT_DIR = "services/data_validation/reports/"

os.makedirs(LOG_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)

def log(message):
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    log_path = f"{LOG_DIR}/validation_{timestamp}.log"
    with open(log_path, "a") as f:
        f.write(message + "\n")
    print(message)

def write_report(rows):
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    
    # CSV
    csv_path = f"{REPORT_DIR}/validation_summary_{timestamp}.csv"
    with open(csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["Symbol", "Issue Type", "Severity", "Period", "Suggested Action"])
        writer.writerows(rows)

    # Markdown
    md_path = f"{REPORT_DIR}/validation_summary_{timestamp}.md"
    with open(md_path, "w") as md:
        md.write("# Validation Summary Report\n\n")
        for r in rows:
            md.write(f"- **{r[0]}** | {r[1]} | **{r[2]}** | {r[3]} | _{r[4]}_\n")

def validate(symbol, quarterly_data):
    issues = []

    issues += check_missing_metrics(symbol, quarterly_data)
    issues += detect_outliers(symbol, quarterly_data)
    issues += check_quarter_continuity(symbol, quarterly_data)
    issues += validate_schema(symbol, quarterly_data)

    for i in issues:
        log(f"[{i['severity']}] {symbol} - {i['issue']}")

    return [
        (symbol, i["issue"], i["severity"], i["period"], i["action"]) 
        for i in issues
    ]

def run_validation(data):
    all_issues = []

    for symbol, q_data in data.items():
        res = validate(symbol, q_data)
        all_issues.extend(res)

    write_report(all_issues)
    print("Validation Completed.")

if __name__ == "__main__":
    # Example input format:
    sample = {
        "AAPL": [
            {"date": "2023-Q1", "revenue": 200, "eps": 1.25},
            {"date": "2023-Q2", "revenue": None, "eps": 1.20},  # Missing revenue
        ]
    }
    run_validation(sample)
