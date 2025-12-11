import os
import csv
from datetime import datetime
import statistics

RULES_PATH = "services/data_validation/rules/validation_rules.yml"
LOG_DIR = "services/data_validation/logs"
REPORT_DIR = "services/data_validation/reports"

os.makedirs(LOG_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)

issues = []

def log_issue(severity, symbol, message, period=""):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_line = f"[{severity}] {symbol} - {message} ({period})"
    print(log_line)

    log_file = os.path.join(LOG_DIR, f"validation_{datetime.now().strftime('%Y%m%d')}.log")
    with open(log_file, "a") as f:
        f.write(f"{timestamp} {log_line}\n")

    issues.append({
        "symbol": symbol,
        "issue_type": message,
        "severity": severity,
        "period": period
    })


def read_csv(path):
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def check_missing(symbol, rows):
    for r in rows:
        for field in ["revenue", "ebitda", "eps"]:
            if r.get(field) in ("", None):
                log_issue("HIGH", symbol, f"Missing {field}", r.get("period"))


def check_promoter(symbol, rows):
    for r in rows:
        try:
            p = float(r.get("promoter_holding_pct", -1))
            if p < 0 or p > 100:
                log_issue("HIGH", symbol, "Invalid promoter holding %", r.get("period"))
        except:
            log_issue("MEDIUM", symbol, "Non-numeric promoter holding", r.get("period"))


def check_outliers(symbol, rows, field):
    values = []
    for r in rows:
        try:
            values.append(float(r[field]))
        except:
            pass

    if len(values) < 2:
        return

    mean = statistics.mean(values)
    std = statistics.pstdev(values)

    for r in rows:
        try:
            v = float(r[field])
            if v > mean + 4*std or v < mean - 4*std:
                log_issue("WARN", symbol, f"Outlier detected for {field}: {v}", r.get("period"))
        except:
            pass


def check_quarter_gaps(symbol, rows):
    periods = [r["period"] for r in rows]
    periods = sorted(periods)

    # naive continuity check
    for i in range(len(periods) - 1):
        current = periods[i]
        nextp = periods[i+1]
        if current[:4] == nextp[:4]:  
            q1 = int(current[-1])
            q2 = int(nextp[-1])
            if q2 - q1 != 1:
                log_issue("HIGH", symbol, f"Missing quarter between {current} and {nextp}")


def generate_report():
    csv_path = os.path.join(REPORT_DIR, f"validation_summary_{datetime.now().strftime('%H%M%S')}.csv")
    with open(csv_path, "w") as f:
        f.write("symbol,issue_type,severity,period\n")
        for i in issues:
            f.write(f"{i['symbol']},{i['issue_type']},{i['severity']},{i['period']}\n")
    print("Report created:", csv_path)


def validate_csv(path):
    rows = read_csv(path)
    symbol = rows[0]["ticker"]

    check_missing(symbol, rows)
    check_promoter(symbol, rows)
    check_quarter_gaps(symbol, rows)
    for field in ["revenue", "ebitda", "net_income"]:
        check_outliers(symbol, rows, field)

    generate_report()


if __name__ == "__main__":
    validate_csv("data/processed/fundamentals/AAPL_fundamentals.csv")
