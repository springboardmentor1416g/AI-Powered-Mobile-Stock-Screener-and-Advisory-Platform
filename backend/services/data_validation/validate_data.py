import os
import csv
import sys
import math
import argparse
import logging
from dataclasses import dataclass
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import psycopg2


BASE_DIR = Path("backend/services/data_validation")
LOG_DIR = BASE_DIR / "logs"
REPORTS_DIR = BASE_DIR / "reports"


# -----------------------------
# Helpers
# -----------------------------
def setup_logger() -> Tuple[logging.Logger, Path]:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path = LOG_DIR / f"validation_{ts}.log"

    logger = logging.getLogger("data_validation")
    logger.setLevel(logging.INFO)
    logger.handlers.clear()

    fmt = logging.Formatter("[%(levelname)s] %(asctime)s - %(message)s")

    fh = logging.FileHandler(log_path, encoding="utf-8")
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    sh = logging.StreamHandler()
    sh.setFormatter(fmt)
    logger.addHandler(sh)

    logger.info(f"Logging to {log_path}")
    return logger, log_path


def get_db_conn():
    db_name = os.getenv("DB_NAME", "stock_screener")
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")

    if not db_password:
        raise RuntimeError("DB_PASSWORD missing. Set DB_PASSWORD env variable.")

    return psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=db_password,
        host=db_host,
        port=int(db_port),
    )


def parse_quarter_label(q: str) -> Tuple[int, int]:
    """
    Accepts: '2023-Q1'
    Returns: (year, quarter)
    """
    y, qn = q.split("-Q")
    return int(y), int(qn)


def quarter_to_date_start(year: int, quarter: int) -> date:
    # Q1 -> Jan 1, Q2 -> Apr 1, Q3 -> Jul 1, Q4 -> Oct 1
    month = (quarter - 1) * 3 + 1
    return date(year, month, 1)


def is_number(x: Any) -> bool:
    try:
        if x is None:
            return False
        float(x)
        return True
    except Exception:
        return False


def mean_std(values: List[float]) -> Tuple[float, float]:
    if not values:
        return 0.0, 0.0
    m = sum(values) / len(values)
    var = sum((v - m) ** 2 for v in values) / max(1, (len(values) - 1))
    return m, math.sqrt(var)


@dataclass
class Issue:
    symbol: str
    issue_type: str
    severity: str  # HIGH / MEDIUM / LOW
    affected_period: str
    suggested_action: str
    details: str = ""


def write_reports(issues: List[Issue], logger: logging.Logger) -> Tuple[Path, Path]:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_path = REPORTS_DIR / f"validation_summary_{ts}.csv"
    md_path = REPORTS_DIR / f"validation_summary_{ts}.md"

    # CSV
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Symbol", "Issue Type", "Severity", "Affected Period", "Suggested Action", "Details"])
        for it in issues:
            w.writerow([it.symbol, it.issue_type, it.severity, it.affected_period, it.suggested_action, it.details])

    # MD
    with md_path.open("w", encoding="utf-8") as f:
        f.write("# Validation Summary (Task 7)\n\n")
        f.write(f"Generated: {datetime.now().isoformat()}\n\n")
        if not issues:
            f.write("✅ No issues detected.\n")
        else:
            f.write(f"Total issues: **{len(issues)}**\n\n")
            f.write("| Symbol | Issue Type | Severity | Period | Suggested Action |\n")
            f.write("|---|---|---|---|---|\n")
            for it in issues[:300]:
                f.write(f"| {it.symbol} | {it.issue_type} | {it.severity} | {it.affected_period} | {it.suggested_action} |\n")

            if len(issues) > 300:
                f.write(f"\n... truncated, showing first 300 issues.\n")

    logger.info(f"Reports written: {csv_path} and {md_path}")
    return csv_path, md_path


# -----------------------------
# DB Fetch
# -----------------------------
def fetch_tickers(conn, limit: int = 0) -> List[str]:
    q = "SELECT ticker FROM companies ORDER BY ticker"
    if limit and limit > 0:
        q += " LIMIT %s"
        with conn.cursor() as cur:
            cur.execute(q, (limit,))
            return [r[0] for r in cur.fetchall()]
    with conn.cursor() as cur:
        cur.execute(q)
        return [r[0] for r in cur.fetchall()]


def fetch_quarterly_metrics(conn, ticker: str) -> List[Dict[str, Any]]:
    """
    Prefer metrics_normalized if it has richer fields.
    Fallback: fundamentals_quarterly
    """
    # Try metrics_normalized
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT period_label, revenue, ebitda, eps, free_cash_flow, total_debt
            FROM metrics_normalized
            WHERE ticker=%s AND period_type='quarterly'
            ORDER BY period_label ASC
            """,
            (ticker,),
        )
        rows = cur.fetchall()

    if rows:
        return [
            {
                "period_label": r[0],
                "revenue": r[1],
                "ebitda": r[2],
                "eps": r[3],
                "free_cash_flow": r[4],
                "total_debt": r[5],
            }
            for r in rows
        ]

    # Fallback fundamentals_quarterly
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT quarter, revenue, NULL::numeric as ebitda, eps, NULL::numeric as free_cash_flow, NULL::numeric as total_debt
            FROM fundamentals_quarterly
            WHERE ticker=%s
            ORDER BY quarter ASC
            """,
            (ticker,),
        )
        rows = cur.fetchall()

    return [
        {
            "period_label": r[0],
            "revenue": r[1],
            "ebitda": r[2],
            "eps": r[3],
            "free_cash_flow": r[4],
            "total_debt": r[5],
        }
        for r in rows
    ]


def fetch_price_history(conn, ticker: str, days: int = 90) -> List[Tuple[datetime, float]]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT time, close
            FROM price_history
            WHERE ticker=%s AND time >= NOW() - (%s || ' days')::interval
            ORDER BY time ASC
            """,
            (ticker, days),
        )
        return [(r[0], float(r[1]) if r[1] is not None else None) for r in cur.fetchall()]


# -----------------------------
# Validators
# -----------------------------
def validate_missing_quarterly(symbol: str, rows: List[Dict[str, Any]]) -> List[Issue]:
    issues: List[Issue] = []
    # mandatory: revenue, eps (you can change to your rules)
    for r in rows:
        pl = str(r["period_label"])
        if r.get("revenue") is None:
            issues.append(Issue(symbol, "Missing revenue", "HIGH", pl, "Impute/Refetch", "revenue is NULL"))
        if r.get("eps") is None:
            issues.append(Issue(symbol, "Missing EPS", "MEDIUM", pl, "Impute/Refetch", "eps is NULL"))
        # Optional: EBITDA might not exist in your current provider output
        if r.get("ebitda") is None:
            issues.append(Issue(symbol, "Missing EBITDA", "MEDIUM", pl, "Refetch/Compute", "ebitda is NULL"))
    return issues


def validate_quarter_continuity(symbol: str, rows: List[Dict[str, Any]]) -> List[Issue]:
    issues: List[Issue] = []
    labels = [str(r["period_label"]) for r in rows if r.get("period_label")]
    if not labels:
        issues.append(Issue(symbol, "No quarterly periods", "HIGH", "-", "Skip company", "No quarterly rows found"))
        return issues

    # duplicates
    seen = set()
    for lb in labels:
        if lb in seen:
            issues.append(Issue(symbol, "Duplicate quarter label", "HIGH", lb, "Deduplicate", "Duplicate period label"))
        seen.add(lb)

    # future-dated
    today = date.today()
    for lb in labels:
        try:
            y, qn = parse_quarter_label(lb)
            start = quarter_to_date_start(y, qn)
            if start > today + timedelta(days=31):
                issues.append(Issue(symbol, "Future-dated quarter", "HIGH", lb, "Skip row", f"Quarter start {start} > today"))
        except Exception:
            issues.append(Issue(symbol, "Quarter label parse failed", "HIGH", lb, "Fix/Normalize", "Could not parse quarter label"))

    # missing gaps (expect step of 3 months)
    parsed = []
    for lb in labels:
        try:
            y, qn = parse_quarter_label(lb)
            parsed.append((y, qn, lb))
        except Exception:
            continue
    parsed.sort()

    for i in range(1, len(parsed)):
        py, pq, plb = parsed[i - 1]
        cy, cq, clb = parsed[i]
        prev_index = py * 4 + pq
        curr_index = cy * 4 + cq
        if curr_index - prev_index > 1:
            issues.append(
                Issue(
                    symbol,
                    "Missing quarter gap",
                    "HIGH",
                    f"{plb} -> {clb}",
                    "Refetch missing quarters",
                    f"Gap of {curr_index - prev_index - 1} quarter(s)",
                )
            )
    return issues


def validate_outliers_qoq(symbol: str, rows: List[Dict[str, Any]]) -> List[Issue]:
    issues: List[Issue] = []
    # revenue spike > 300% QoQ
    series = []
    for r in rows:
        if r.get("revenue") is not None and is_number(r.get("revenue")):
            series.append((str(r["period_label"]), float(r["revenue"])))
    for i in range(1, len(series)):
        prev_label, prev_val = series[i - 1]
        curr_label, curr_val = series[i]
        if prev_val != 0:
            growth = (curr_val - prev_val) / abs(prev_val)
            if growth > 3.0:
                issues.append(Issue(symbol, "Revenue spike QoQ", "MEDIUM", curr_label, "Manual review", f"{growth*100:.1f}% QoQ"))
    return issues


def validate_price_spikes(symbol: str, points: List[Tuple[datetime, float]]) -> List[Issue]:
    issues: List[Issue] = []
    closes = [(t, c) for (t, c) in points if c is not None]
    for i in range(1, len(closes)):
        t0, p0 = closes[i - 1]
        t1, p1 = closes[i]
        if p0 != 0:
            jump = (p1 - p0) / abs(p0)
            if abs(jump) > 0.40:
                issues.append(Issue(symbol, "Price spike", "MEDIUM", t1.strftime("%Y-%m-%d"), "Manual review", f"{jump*100:.1f}% day change"))
    return issues


def validate_numeric_types(symbol: str, rows: List[Dict[str, Any]]) -> List[Issue]:
    issues: List[Issue] = []
    numeric_fields = ["revenue", "ebitda", "eps", "free_cash_flow", "total_debt"]
    for r in rows:
        pl = str(r.get("period_label", "-"))
        for f in numeric_fields:
            v = r.get(f)
            if v is None:
                continue
            if not is_number(v):
                issues.append(Issue(symbol, "Non-numeric field", "HIGH", pl, "Fix normalization", f"{f}='{v}'"))
    return issues


# -----------------------------
# Main
# -----------------------------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ticker", help="Validate single ticker")
    parser.add_argument("--max-tickers", type=int, default=0, help="Limit tickers from DB")
    parser.add_argument("--price-days", type=int, default=90, help="Price lookback window")
    parser.add_argument("--fail-on-high", action="store_true", help="Exit code 1 if any HIGH issues exist")
    args = parser.parse_args()

    logger, _ = setup_logger()

    conn = get_db_conn()

    if args.ticker:
        tickers = [args.ticker.strip().upper()]
    else:
        tickers = fetch_tickers(conn, args.max_tickers)

    logger.info(f"Tickers to validate: {tickers}")

    issues: List[Issue] = []

    for sym in tickers:
        q_rows = fetch_quarterly_metrics(conn, sym)
        p_points = fetch_price_history(conn, sym, days=args.price_days)

        sym_issues = []
        sym_issues += validate_missing_quarterly(sym, q_rows)
        sym_issues += validate_quarter_continuity(sym, q_rows)
        sym_issues += validate_numeric_types(sym, q_rows)
        sym_issues += validate_outliers_qoq(sym, q_rows)
        sym_issues += validate_price_spikes(sym, p_points)

        if not sym_issues:
            logger.info(f"{sym} - Validation passed")
        else:
            # log them
            for it in sym_issues[:200]:
                lvl = logging.ERROR if it.severity == "HIGH" else logging.WARNING
                logger.log(lvl, f"{sym} - {it.issue_type} ({it.severity}) [{it.affected_period}] -> {it.suggested_action} :: {it.details}")
            logger.info(f"{sym} - Issues found: {len(sym_issues)}")

        issues.extend(sym_issues)

    csv_path, md_path = write_reports(issues, logger)

    high_count = sum(1 for i in issues if i.severity == "HIGH")
    med_count = sum(1 for i in issues if i.severity == "MEDIUM")
    low_count = sum(1 for i in issues if i.severity == "LOW")

    logger.info(f"Summary: HIGH={high_count}, MEDIUM={med_count}, LOW={low_count}")
    logger.info("Task 7 validation complete.")

    conn.close()

    if args.fail_on_high and high_count > 0:
        logger.error("Failing because HIGH severity issues exist.")
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
