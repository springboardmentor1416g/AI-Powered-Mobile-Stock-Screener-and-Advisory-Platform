import argparse
import csv
from pathlib import Path
from datetime import datetime


from validators.quarter_continuity import check_quarter_continuity
from validators.null_checks import check_nulls
from validators.numeric_checks import check_negative_values

def parse_args():
    parser = argparse.ArgumentParser(
        description="Validate fundamental financial data"
    )
    parser.add_argument(
        "--input-file",
        required=True,
        help="Path to normalized fundamentals CSV file"
    )
    return parser.parse_args()


BASE = Path("services/data_validation")
LOG_DIR = BASE / "logs"
REPORT_DIR = BASE / "reports"

LOG_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)


def main():
    args = parse_args()
    data_file = args.input_file

    if not Path(data_file).exists():
        raise FileNotFoundError(f"Input file not found: {data_file}")

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")

    log_file = LOG_DIR / f"validation_{ts}.log"
    report_file = REPORT_DIR / f"validation_report_{ts}.md"

    errors = []
    warnings = []
    company_quarters = {}

    with open(data_file, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            symbol = row["symbol"]
            quarter = row["period"]

            company_quarters.setdefault(symbol, []).append(quarter)
            # (rest of your validation logic)

            errors.extend(
                check_nulls(
                    symbol,
                    row,
                    ["revenue", "net_income", "ebitda"]
                )
            )

            warnings.extend(
                check_negative_values(
                    symbol,
                    row,
                    ["revenue", "net_income", "ebitda"]
                )
            )

    for symbol, quarters in company_quarters.items():
        errors.extend(check_quarter_continuity(symbol, quarters))

    # Write log
    with open(log_file, "w") as log:
        for w in warnings:
            log.write(w + "\n")
        for e in errors:
            log.write(e + "\n")

    # Write report
    with open(report_file, "w") as report:
        report.write("# Data Validation Report\n\n")
        report.write(f"- Errors: {len(errors)}\n")
        report.write(f"- Warnings: {len(warnings)}\n\n")

        if errors:
            report.write("## Errors\n")
            report.write("\n".join(errors))
        else:
            report.write("No critical errors found.\n")

    print("✅ Data validation completed")
    print(f"Logs written to: {log_file}")
    print(f"Report written to: {report_file}")


if __name__ == "__main__":
    main()
