# backend/ingestion/fundamentals_ingest.py
"""
Fetch fundamentals (annual + quarterly) via yfinance and store as JSON in DB.
Usage:
  python backend/ingestion/fundamentals_ingest.py INFY
"""

import argparse
import os
import json
from datetime import datetime
import yfinance as yf
from sqlalchemy import text
from backend.services.market_data_service import save_raw_json, ensure_dir, ENGINE

def insert_fundamentals_quarterly(ticker: str, period_end_str: str, report_type: str, statement_json: dict):
    sql = text("""
    INSERT INTO fundamentals_quarterly (ticker, period_end, fiscal_period, report_type, statement)
    VALUES (:ticker, :period_end, :fiscal_period, :report_type, :statement)
    ON CONFLICT (ticker, period_end, report_type) DO UPDATE
      SET statement = EXCLUDED.statement
    """)
    with ENGINE.begin() as conn:
        conn.execute(sql, {
            "ticker": ticker,
            "period_end": period_end_str,
            "fiscal_period": period_end_str,  # placeholder
            "report_type": report_type,
            "statement": json.dumps(statement_json)
        })

def insert_fundamentals_annual(ticker: str, period_end_str: str, fiscal_year: int, statement_json: dict):
    sql = text("""
    INSERT INTO fundamentals_annual (ticker, period_end, fiscal_year, statement)
    VALUES (:ticker, :period_end, :fiscal_year, :statement)
    ON CONFLICT (ticker, period_end) DO UPDATE
      SET statement = EXCLUDED.statement
    """)
    with ENGINE.begin() as conn:
        conn.execute(sql, {
            "ticker": ticker,
            "period_end": period_end_str,
            "fiscal_year": fiscal_year,
            "statement": json.dumps(statement_json)
        })

def fetch_and_store_fundamentals(ticker: str, out_base="storage"):
    print(f"[{datetime.utcnow().isoformat()}] Fetching fundamentals for {ticker}")
    t = yf.Ticker(ticker)
    # Annual statements (financials) - reported as dataframe by yfinance (columns=years)
    try:
        fin = t.financials
        bs = t.balance_sheet
        cf = t.cashflow
        # Convert to JSON-friendly dicts (transpose)
        fin_json = fin.fillna("").to_dict(orient="index") if fin is not None else {}
        bs_json = bs.fillna("").to_dict(orient="index") if bs is not None else {}
        cf_json = cf.fillna("").to_dict(orient="index") if cf is not None else {}

        raw_payload = {
            "ticker": ticker,
            "fetched_at": datetime.utcnow().isoformat(),
            "financials_present": bool(fin_json),
            "balance_sheet_present": bool(bs_json),
            "cashflow_present": bool(cf_json)
        }
        save_raw_json(ticker, raw_payload, base_dir=os.path.join(out_base, "raw", "fundamentals"))

        # For each column in financials (each column is a period end)
        if fin_json:
            # fin_json keys are the row names (e.g., 'Total Revenue') with values = {period: value, ...}
            # We transform by period by transposing
            df_fin = t.financials
            if df_fin is not None and not df_fin.empty:
                # columns are period ends; collect per column
                for col in df_fin.columns:
                    stmt = df_fin[col].fillna("").to_dict()
                    period_end_str = str(col.date()) if hasattr(col, "date") else str(col)
                    fiscal_year = getattr(col, "year", None)
                    insert_fundamentals_annual(ticker, period_end_str, fiscal_year or 0, stmt)

        # Quarterly
        q_fin = t.quarterly_financials
        if q_fin is not None and not q_fin.empty:
            for col in q_fin.columns:
                stmt = q_fin[col].fillna("").to_dict()
                period_end_str = str(col.date()) if hasattr(col, "date") else str(col)
                insert_fundamentals_quarterly(ticker, period_end_str, "income_statement_quarterly", stmt)

        print(f"Stored fundamentals for {ticker}")
    except Exception as e:
        print(f"Error fetching fundamentals for {ticker}: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("ticker", nargs="?", default="INFY", help="Ticker symbol")
    args = parser.parse_args()
    fetch_and_store_fundamentals(args.ticker)
