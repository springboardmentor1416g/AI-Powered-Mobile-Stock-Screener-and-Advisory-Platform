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

    conn.commit()
    cur.close()
    conn.close()

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
