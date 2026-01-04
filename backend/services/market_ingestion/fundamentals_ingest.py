<<<<<<< HEAD
import os
import json
import csv
import requests
from datetime import datetime
import psycopg2

API_KEY = os.getenv("MARKETDATA_API_KEY", "DEMO_KEY")
BASE_URL = "https://financialmodelingprep.com/api/v3"

RAW_OUTPUT = "data/processed/fundamentals/"

def fetch_fundamentals(symbol):
    """Fetch annual and quarterly fundamental metrics."""
    url = f"{BASE_URL}/income-statement/{symbol}?apikey={API_KEY}"
    response = requests.get(url)
    return response.json()

def normalize_fundamentals(raw_data):
    """Normalize provider fields into a consistent CSV structure."""
    normalized = []
    for item in raw_data:
        normalized.append({
            "symbol": item.get("symbol"),
            "date": item.get("date"),
            "revenue": item.get("revenue"),
            "gross_profit": item.get("grossProfit"),
            "operating_income": item.get("operatingIncome"),
            "net_income": item.get("netIncome"),
            "eps": item.get("eps"),
            "total_debt": item.get("totalDebt"),
            "free_cash_flow": item.get("freeCashFlow"),
        })
    return normalized

def save_csv(symbol, data):
    """Save normalized metrics into processed CSV output."""
    os.makedirs(RAW_OUTPUT, exist_ok=True)

    path = f"{RAW_OUTPUT}/{symbol}_fundamentals.csv"
    with open(path, "w", newline="") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    return path

def load_into_db(symbol, records):
    conn = psycopg2.connect(
        host="localhost",
        database="stock_screener",
        user="postgres",
        password="postgres"
    )
    cur = conn.cursor()

    for r in records:
        cur.execute("""
            INSERT INTO fundamentals_quarterly (
                ticker, quarter, revenue, net_income, eps
            ) VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING;
        """, (
            r["symbol"], r["date"], r["revenue"], r["net_income"], r["eps"]
        ))
=======
"""
Fundamental Data Ingestion & Normalization

This script:
1. Builds simple sample fundamental data (simulating an API response).
2. Normalizes it into a consistent schema (columns).
3. Saves it as CSV files into data/processed/fundamentals/.
4. Inserts quarterly metrics into fundamentals_quarterly table in PostgreSQL.

Note:
- This is a skeleton/example for the internship module.
- In a real setup, step 1 would call a real API (e.g., SimFin, Alpha Vantage, FMP).
"""

import os
import csv
from datetime import datetime

import psycopg2


# -------------------------
# Config
# -------------------------

DB_NAME = os.getenv("DB_NAME", "stock_screener_dev")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

OUTPUT_DIR = os.path.join("data", "processed", "fundamentals")
LOG_PATH = os.path.join("logs", "ingestion_fundamentals.log")


def log(message: str):
    """Simple logger that prints and appends to logs/ingestion_fundamentals.log."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {message}"
    print(line)

    os.makedirs("logs", exist_ok=True)
    with open(LOG_PATH, "a") as f:
        f.write(line + "\n")


def get_db_connection():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
    )
    return conn


# -------------------------
# Step 1: Simulate fundamentals data (placeholder for real API)
# -------------------------

def simulate_fundamentals_for_ticker(ticker: str):
    """
    Simulate quarterly fundamentals for a ticker.
    In real pipeline, this function would transform JSON from external API.
    """

    # Example: last 4 quarters (Q1–Q4 of 2024)
    quarters = ["2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4"]
    data = []

    base_revenue = 100_000_000  # 100M
    for i, q in enumerate(quarters):
        revenue = base_revenue * (1 + 0.05 * i)  # simple growth
        gross_profit = revenue * 0.4
        ebitda = revenue * 0.25
        operating_income = revenue * 0.2
        net_income = revenue * 0.15
        eps = 10 + i  # fake EPS growth
        total_debt = 50_000_000
        cash = 20_000_000
        fcf = net_income * 0.8
        pe = 20 - i  # PE slightly compressing
        pb = 4 - 0.2 * i
        ps = 3 + 0.1 * i
        promoter_holding = 55.0
        institutional_holding = 25.0

        row = {
            "ticker": ticker,
            "period": q,
            "revenue": int(revenue),
            "gross_profit": int(gross_profit),
            "ebitda": int(ebitda),
            "operating_income": int(operating_income),
            "net_income": int(net_income),
            "eps": round(eps, 2),
            "total_debt": int(total_debt),
            "cash": int(cash),
            "fcf": int(fcf),
            "pe_ratio": round(pe, 2),
            "pb_ratio": round(pb, 2),
            "ps_ratio": round(ps, 2),
            "promoter_holding_pct": promoter_holding,
            "institutional_holding_pct": institutional_holding,
        }
        data.append(row)

    return data


# -------------------------
# Step 2: Save normalized CSV
# -------------------------

def save_normalized_csv(ticker: str, rows: list):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filename = f"{ticker}_fundamentals.csv"
    path = os.path.join(OUTPUT_DIR, filename)

    if not rows:
        log(f"No fundamentals data for {ticker}, skipping CSV.")
        return

    # Use the keys of the first row as CSV headers
    headers = list(rows[0].keys())

    with open(path, "w", newline="") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=headers)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)

    log(f"Saved normalized fundamentals CSV for {ticker} -> {path}")


# -------------------------
# Step 3: Insert into fundamentals_quarterly table
# -------------------------

def insert_into_fundamentals_quarterly(rows: list):
    """
    Insert basic columns into fundamentals_quarterly:
    (ticker, quarter, revenue, net_income, eps, pe_ratio, pb_ratio)
    """
    if not rows:
        return

    conn = get_db_connection()
    cur = conn.cursor()

    for row in rows:
        insert_query = """
        INSERT INTO fundamentals_quarterly
        (ticker, quarter, revenue, net_income, eps, pe_ratio, pb_ratio)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ;
        """
        cur.execute(
            insert_query,
            (
                row["ticker"],
                row["period"],
                row["revenue"],
                row["net_income"],
                row["eps"],
                row["pe_ratio"],
                row["pb_ratio"],
            ),
        )
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37

    conn.commit()
    cur.close()
    conn.close()
<<<<<<< HEAD

def run(symbols):
    print("Fundamental ingestion started…")

    for sym in symbols:
        raw = fetch_fundamentals(sym)
        normalized = normalize_fundamentals(raw)
        csv_path = save_csv(sym, normalized)
        load_into_db(sym, normalized)
        print(f"Completed → {sym}")

    print("Fundamental ingestion completed.")

if __name__ == "__main__":
    run(["AAPL", "MSFT", "GOOGL"])
=======
    log(f"Inserted {len(rows)} rows into fundamentals_quarterly.")


# -------------------------
# Main runner
# -------------------------

def run_fundamentals_ingestion():
    log("Starting fundamentals ingestion...")

    # Example tickers; in real world this comes from companies table / config
    tickers = ["AAPL", "MSFT", "GOOGL"]

    for ticker in tickers:
        log(f"Processing fundamentals for {ticker}...")
        rows = simulate_fundamentals_for_ticker(ticker)
        save_normalized_csv(ticker, rows)
        insert_into_fundamentals_quarterly(rows)

    log("Fundamentals ingestion finished.")


if __name__ == "__main__":
    run_fundamentals_ingestion()
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
