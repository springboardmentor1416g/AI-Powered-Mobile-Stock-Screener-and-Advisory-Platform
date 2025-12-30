import os
import csv
import time
import argparse
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

import requests
import psycopg2


# ================= Paths =================
LOG_DIR = Path("logs")
DATA_PROCESSED_DIR = Path("data/processed/fundamentals")
DOCS_DIR = Path("docs")


# ================= Logger =================
def setup_logger() -> Tuple[logging.Logger, Path]:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path = LOG_DIR / f"ingestion_fundamentals_task6_{ts}.log"

    logger = logging.getLogger("fundamentals_ingest")
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


# ================= DB =================
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


def fetch_tickers_from_db(conn) -> List[str]:
    with conn.cursor() as cur:
        cur.execute("SELECT ticker FROM companies ORDER BY ticker;")
        return [r[0] for r in cur.fetchall()]


def get_table_columns(conn, table: str) -> List[str]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema='public' AND table_name=%s
            ORDER BY ordinal_position;
            """,
            (table,),
        )
        return [r[0] for r in cur.fetchall()]


# ================= Helpers =================
def parse_period_label(fiscal_date_ending: str) -> str:
    # YYYY-MM-DD -> YYYY-Qn
    dt = datetime.strptime(fiscal_date_ending, "%Y-%m-%d")
    q = (dt.month - 1) // 3 + 1
    return f"{dt.year}-Q{q}"


def safe_float(x) -> Optional[float]:
    if x in (None, "", "None"):
        return None
    try:
        return float(x)
    except Exception:
        return None


def safe_int(x) -> Optional[int]:
    if x in (None, "", "None"):
        return None
    try:
        return int(float(x))
    except Exception:
        return None


def compute_debt_to_fcf(total_debt: Optional[int], fcf: Optional[int]) -> Optional[float]:
    if total_debt is None or fcf is None or fcf == 0:
        return None
    # if FCF negative, repayment ratio isn't meaningful; keep abs to avoid weird negatives
    return float(total_debt) / float(abs(fcf))


def write_csv(path: Path, rows: List[Dict[str, Any]], fieldnames: List[str]):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k) for k in fieldnames})


# ================= Alpha Vantage Calls (no provider dependency) =================
def av_get(function_name: str, symbol: str, api_key: str, base_url: str, extra_params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    params = {"function": function_name, "symbol": symbol, "apikey": api_key}
    if extra_params:
        params.update(extra_params)

    resp = requests.get(base_url, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    # Handle AlphaVantage throttling / errors
    if isinstance(data, dict) and ("Note" in data or "Information" in data):
        # Usually rate limit: "Thank you for using Alpha Vantage! Our standard API rate limit is..."
        raise RuntimeError(f"AlphaVantage throttled: {data.get('Note') or data.get('Information')}")
    if isinstance(data, dict) and "Error Message" in data:
        raise RuntimeError(f"AlphaVantage error: {data['Error Message']}")
    return data


def fetch_income_statement(symbol: str, api_key: str, base_url: str) -> Dict[str, Any]:
    return av_get("INCOME_STATEMENT", symbol, api_key, base_url)


def fetch_balance_sheet(symbol: str, api_key: str, base_url: str) -> Dict[str, Any]:
    return av_get("BALANCE_SHEET", symbol, api_key, base_url)


def fetch_cash_flow(symbol: str, api_key: str, base_url: str) -> Dict[str, Any]:
    return av_get("CASH_FLOW", symbol, api_key, base_url)


def fetch_company_overview(symbol: str, api_key: str, base_url: str) -> Dict[str, Any]:
    # This replaces provider.company_overview(...)
    return av_get("OVERVIEW", symbol, api_key, base_url)


# ================= DB Writers (safe inserts / dedupe) =================
def exists_fundamentals_quarterly(conn, ticker: str, quarter: str) -> bool:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT 1 FROM fundamentals_quarterly WHERE ticker=%s AND quarter=%s LIMIT 1;",
            (ticker, quarter),
        )
        return cur.fetchone() is not None


def exists_fundamentals_annual(conn, ticker: str, year: int) -> bool:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT 1 FROM fundamentals_annual WHERE ticker=%s AND year=%s LIMIT 1;",
            (ticker, year),
        )
        return cur.fetchone() is not None


def exists_metrics_normalized(conn, ticker: str, period_type: str, period_label: str) -> bool:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT 1 FROM metrics_normalized WHERE ticker=%s AND period_type=%s AND period_label=%s LIMIT 1;",
            (ticker, period_type, period_label),
        )
        return cur.fetchone() is not None


def insert_cashflow(conn, ticker: str, period: str, cfo: Optional[int], cfi: Optional[int], cff: Optional[int], capex: Optional[int], dry_run: bool):
    q = """
    INSERT INTO cashflow_statements (ticker, period, cfo, cfi, cff, capex)
    VALUES (%s, %s, %s, %s, %s, %s);
    """
    if dry_run:
        return
    with conn.cursor() as cur:
        cur.execute(q, (ticker, period, cfo, cfi, cff, capex))


def insert_debt_profile(conn, ticker: str, quarter: str, short_debt: Optional[int], long_debt: Optional[int], debt_to_equity: Optional[float], dry_run: bool):
    q = """
    INSERT INTO debt_profile (ticker, quarter, short_term_debt, long_term_debt, debt_to_equity)
    VALUES (%s, %s, %s, %s, %s);
    """
    if dry_run:
        return
    with conn.cursor() as cur:
        cur.execute(q, (ticker, quarter, short_debt, long_debt, debt_to_equity))


def insert_fundamentals_quarterly(conn, row: Dict[str, Any], dry_run: bool):
    q = """
    INSERT INTO fundamentals_quarterly
    (ticker, quarter, revenue, net_income, eps, operating_margin, roe, roa, pe_ratio, pb_ratio)
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);
    """
    if dry_run:
        return
    with conn.cursor() as cur:
        cur.execute(
            q,
            (
                row["ticker"],
                row["quarter"],
                row.get("revenue"),
                row.get("net_income"),
                row.get("eps"),
                row.get("operating_margin"),
                row.get("roe"),
                row.get("roa"),
                row.get("pe_ratio"),
                row.get("pb_ratio"),
            ),
        )


def insert_fundamentals_annual(conn, row: Dict[str, Any], dry_run: bool):
    q = """
    INSERT INTO fundamentals_annual
    (ticker, year, revenue, net_income, eps, operating_margin, roe, roa, pe_ratio, pb_ratio)
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);
    """
    if dry_run:
        return
    with conn.cursor() as cur:
        cur.execute(
            q,
            (
                row["ticker"],
                row["year"],
                row.get("revenue"),
                row.get("net_income"),
                row.get("eps"),
                row.get("operating_margin"),
                row.get("roe"),
                row.get("roa"),
                row.get("pe_ratio"),
                row.get("pb_ratio"),
            ),
        )


def insert_metrics_normalized_dynamic(conn, available_cols: List[str], payload: Dict[str, Any], dry_run: bool):
    """
    Insert into metrics_normalized, but only using columns that exist in DB.
    Prevents errors like: column "source" does not exist.
    """
    cols = [c for c in payload.keys() if c in available_cols]
    if not cols:
        return

    placeholders = ", ".join(["%s"] * len(cols))
    col_sql = ", ".join(cols)

    q = f"INSERT INTO metrics_normalized ({col_sql}) VALUES ({placeholders});"

    if dry_run:
        return
    with conn.cursor() as cur:
        cur.execute(q, tuple(payload[c] for c in cols))


# ================= Main =================
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ticker", help="Single ticker to ingest (e.g., AAPL)")
    parser.add_argument("--max-tickers", type=int, default=0, help="Limit tickers from DB")
    parser.add_argument("--dry-run", action="store_true", help="Do not write to DB; only log + write processed CSVs")
    parser.add_argument("--sleep", type=float, default=12.0, help="Sleep seconds between API calls (AlphaVantage rate limits)")
    args = parser.parse_args()

    logger, _ = setup_logger()

    av_key = os.getenv("ALPHAVANTAGE_API_KEY") or os.getenv("MARKETDATA_API_KEY")
    if not av_key:
        raise RuntimeError("Missing ALPHAVANTAGE_API_KEY (or MARKETDATA_API_KEY). Set it in env variables.")

    base_url = os.getenv("ALPHAVANTAGE_BASE_URL", "https://www.alphavantage.co/query")
    default_currency = os.getenv("DEFAULT_CURRENCY", "USD")

    conn = get_db_conn()
    metrics_cols = get_table_columns(conn, "metrics_normalized")
    logger.info(f"metrics_normalized columns detected: {len(metrics_cols)}")

    # choose tickers
    if args.ticker:
        tickers = [args.ticker.strip().upper()]
    else:
        tickers = fetch_tickers_from_db(conn)
        if args.max_tickers and args.max_tickers > 0:
            tickers = tickers[: args.max_tickers]

    logger.info(f"Tickers to ingest: {tickers}")

    processed_quarterly: List[Dict[str, Any]] = []
    processed_annual: List[Dict[str, Any]] = []
    validation_issues: List[str] = []

    for t in tickers:
        try:
            # ---- Fetch (income, balance, cashflow, overview) ----
            inc = fetch_income_statement(t, av_key, base_url)
            time.sleep(args.sleep)

            bs = fetch_balance_sheet(t, av_key, base_url)
            time.sleep(args.sleep)

            cf = fetch_cash_flow(t, av_key, base_url)
            time.sleep(args.sleep)

            # overview is optional (PEG/PE might be missing sometimes)
            ov = {}
            try:
                ov = fetch_company_overview(t, av_key, base_url)
            except Exception as e:
                logger.warning(f"{t}: overview fetch failed (non-fatal) - {e}")

            q_inc = inc.get("quarterlyReports", []) or []
            a_inc = inc.get("annualReports", []) or []

            q_bs = {r.get("fiscalDateEnding"): r for r in (bs.get("quarterlyReports", []) or [])}
            q_cf = {r.get("fiscalDateEnding"): r for r in (cf.get("quarterlyReports", []) or [])}

            # ---------------- QUARTERLY ----------------
            for r in q_inc[:24]:
                fde = r.get("fiscalDateEnding")
                if not fde:
                    continue
                quarter = parse_period_label(fde)

                revenue = safe_int(r.get("totalRevenue"))
                net_income = safe_int(r.get("netIncome"))
                eps = safe_float(r.get("reportedEPS"))
                ebitda = safe_int(r.get("ebitda"))  # AV often provides this

                # Cashflow / FCF
                cfr = q_cf.get(fde, {}) or {}
                cfo = safe_int(cfr.get("operatingCashflow"))
                capex = safe_int(cfr.get("capitalExpenditures"))  # often negative in AV
                cfi = safe_int(cfr.get("cashflowFromInvestment"))
                cff = safe_int(cfr.get("cashflowFromFinancing"))

                fcf = None
                if cfo is not None and capex is not None:
                    # If capex is negative, CFO - (negative) inflates; use CFO + capex when capex negative
                    fcf = cfo + capex if capex < 0 else cfo - capex

                # Debt
                bsr = q_bs.get(fde, {}) or {}
                short_debt = safe_int(bsr.get("shortTermDebt"))
                long_debt = safe_int(bsr.get("longTermDebt"))
                total_debt = None
                if short_debt is not None or long_debt is not None:
                    total_debt = (short_debt or 0) + (long_debt or 0)

                debt_to_fcf = compute_debt_to_fcf(total_debt, fcf)

                # Validation (basic)
                if revenue is None:
                    validation_issues.append(f"[ERROR] {t} - Missing revenue for {quarter}")
                if eps is None:
                    validation_issues.append(f"[WARN] {t} - Missing EPS for {quarter}")

                processed_quarterly.append(
                    {
                        "ticker": t,
                        "quarter": quarter,
                        "revenue": revenue,
                        "net_income": net_income,
                        "eps": eps,
                        "ebitda": ebitda,
                        "fcf": fcf,
                        "total_debt": total_debt,
                        "debt_to_fcf": debt_to_fcf,
                    }
                )

                # DB writes (dedupe)
                if not args.dry_run:
                    insert_cashflow(conn, t, quarter, cfo, cfi, cff, capex, dry_run=False)
                    insert_debt_profile(conn, t, quarter, short_debt, long_debt, None, dry_run=False)

                    if not exists_fundamentals_quarterly(conn, t, quarter):
                        insert_fundamentals_quarterly(
                            conn,
                            {
                                "ticker": t,
                                "quarter": quarter,
                                "revenue": revenue,
                                "net_income": net_income,
                                "eps": eps,
                                "operating_margin": None,
                                "roe": None,
                                "roa": None,
                                "pe_ratio": safe_float(ov.get("PERatio")),
                                "pb_ratio": safe_float(ov.get("PriceToBookRatio")),
                            },
                            dry_run=False,
                        )

                    # metrics_normalized (period_type=quarterly)
                    if not exists_metrics_normalized(conn, t, "quarterly", quarter):
                        insert_metrics_normalized_dynamic(
                            conn,
                            metrics_cols,
                            {
                                "ticker": t,
                                "period_type": "quarterly",
                                "period_label": quarter,
                                "revenue": revenue,
                                "ebitda": ebitda,
                                "net_income": net_income,
                                "eps": eps,
                                "free_cash_flow": fcf,
                                "total_debt": total_debt,
                                "debt_to_fcf": debt_to_fcf,
                                "peg_ratio": safe_float(ov.get("PEGRatio")),
                                "currency": default_currency,
                                "created_at": datetime.utcnow(),
                            },
                            dry_run=False,
                        )

            # ---------------- ANNUAL ----------------
            for r in a_inc[:20]:
                fde = r.get("fiscalDateEnding")
                if not fde:
                    continue
                year = datetime.strptime(fde, "%Y-%m-%d").year

                revenue = safe_int(r.get("totalRevenue"))
                net_income = safe_int(r.get("netIncome"))
                eps = safe_float(r.get("reportedEPS"))
                ebitda = safe_int(r.get("ebitda"))

                processed_annual.append(
                    {"ticker": t, "year": year, "revenue": revenue, "net_income": net_income, "eps": eps, "ebitda": ebitda}
                )

                if not args.dry_run:
                    if not exists_fundamentals_annual(conn, t, year):
                        insert_fundamentals_annual(
                            conn,
                            {
                                "ticker": t,
                                "year": year,
                                "revenue": revenue,
                                "net_income": net_income,
                                "eps": eps,
                                "operating_margin": None,
                                "roe": None,
                                "roa": None,
                                "pe_ratio": safe_float(ov.get("PERatio")),
                                "pb_ratio": safe_float(ov.get("PriceToBookRatio")),
                            },
                            dry_run=False,
                        )

                    year_label = str(year)
                    if not exists_metrics_normalized(conn, t, "annual", year_label):
                        insert_metrics_normalized_dynamic(
                            conn,
                            metrics_cols,
                            {
                                "ticker": t,
                                "period_type": "annual",
                                "period_label": year_label,
                                "revenue": revenue,
                                "ebitda": ebitda,
                                "net_income": net_income,
                                "eps": eps,
                                "peg_ratio": safe_float(ov.get("PEGRatio")),
                                "currency": default_currency,
                                "created_at": datetime.utcnow(),
                            },
                            dry_run=False,
                        )

            if not args.dry_run:
                conn.commit()

            logger.info(f"{t}: fundamentals fetched OK (q={len(q_inc)}, a={len(a_inc)})")

        except Exception as e:
            logger.exception(f"{t}: ingestion failed - {e}")
            if not args.dry_run:
                conn.rollback()

    # ---------------- Deliverables: CSVs + report ----------------
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    q_csv = DATA_PROCESSED_DIR / f"fundamentals_quarterly_{ts}.csv"
    a_csv = DATA_PROCESSED_DIR / f"fundamentals_annual_{ts}.csv"

    write_csv(
        q_csv,
        processed_quarterly,
        ["ticker", "quarter", "revenue", "ebitda", "net_income", "eps", "fcf", "total_debt", "debt_to_fcf"],
    )
    write_csv(
        a_csv,
        processed_annual,
        ["ticker", "year", "revenue", "ebitda", "net_income", "eps"],
    )
    logger.info(f"Processed CSVs written: {q_csv} and {a_csv}")

    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    report_path = DOCS_DIR / "validation_report.md"
    with report_path.open("w", encoding="utf-8") as f:
        f.write("# Validation Report (Task 6)\n\n")
        f.write(f"Generated: {datetime.now().isoformat()}\n\n")
        if validation_issues:
            f.write("## Issues\n\n")
            for i in validation_issues[:400]:
                f.write(f"- {i}\n")
        else:
            f.write("## Issues\n\nNo issues detected in basic checks.\n")
    logger.info(f"Report written: {report_path}")

    logger.info("Task 6 ingestion complete.")
    conn.close()


if __name__ == "__main__":
    main()
