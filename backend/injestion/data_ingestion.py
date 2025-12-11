"""
Data Ingestion Script (UPDATED)

This script now does:
1. Fetch price history from API
2. Save raw API JSON to /storage/raw/
3. Convert JSON to CSV for validation
4. Run validation script BEFORE inserting into DB
5. Insert into DB ONLY if validation passes
"""

import os
import json
from datetime import datetime
import csv
import subprocess
import sys

import psycopg2
from backend.services.market_data_service import fetch_daily_price_history


# Database connection settings
DB_NAME = os.getenv("DB_NAME", "stock_screener")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

RAW_BASE_DIR = os.path.join("storage", "raw")
PROCESSED_BASE_DIR = os.path.join("data", "processed", "price")


def get_db_connection():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
    )
    return conn


def save_raw_json(symbol: str, data: dict):
    today = datetime.now().strftime("%Y-%m-%d")
    folder_path = os.path.join(RAW_BASE_DIR, today)
    os.makedirs(folder_path, exist_ok=True)

    file_path = os.path.join(folder_path, f"{symbol}.json")
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"[RAW] Saved raw data for {symbol} → {file_path}")


def convert_to_csv(symbol: str, data: dict):
    """
    Convert API JSON → CSV for validation
    """
    os.makedirs(PROCESSED_BASE_DIR, exist_ok=True)
    csv_path = os.path.join(PROCESSED_BASE_DIR, f"{symbol}_price.csv")

    time_series = data.get("Time Series (Daily)", {})

    with open(csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["ticker", "date", "open", "high", "low", "close", "volume"])

        for date_str, v in time_series.items():
            writer.writerow([
                symbol,
                date_str,
                v["1. open"],
                v["2. high"],
                v["3. low"],
                v["4. close"],
                v["5. volume"],
            ])

    print(f"[CSV] Wrote CSV for {symbol} → {csv_path}")
    return csv_path


def validate_csv(csv_path):
    """
    Run the validation script.
    If validation has HIGH issues → return False
    Else return True
    """
    result = subprocess.run([
        sys.executable,
        "backend/services/data_validation/validate_data.py",
        "--input",
        csv_path
    ])

    if result.returncode == 2:
        print("[VALIDATION] HIGH severity issues found → BLOCKING DB insert")
        return False

    print("[VALIDATION] Passed")
    return True


def insert_price_history(symbol: str, data: dict):
    time_series = data.get("Time Series (Daily)", {})

    conn = get_db_connection()
    cur = conn.cursor()

    for date_str, values in time_series.items():
        query = """
        INSERT INTO price_history (time, ticker, open, high, low, close, volume)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (time, ticker) DO NOTHING;
        """
        cur.execute(query, (
            date_str + " 09:15:00",
            symbol,
            float(values["1. open"]),
            float(values["2. high"]),
            float(values["3. low"]),
            float(values["4. close"]),
            int(float(values["5. volume"])),
        ))

    conn.commit()
    cur.close()
    conn.close()
    print(f"[DB] Inserted price rows for {symbol}")


def run_ingestion():
    symbols = ["AAPL", "MSFT", "GOOGL"]

    for symbol in symbols:
        print(f"\n=== Ingesting {symbol} ===")
        data = fetch_daily_price_history(symbol)

        save_raw_json(symbol, data)
        csv_path = convert_to_csv(symbol, data)

        if validate_csv(csv_path):
            insert_price_history(symbol, data)
        else:
            print(f"[SKIPPED] DB insert skipped for {symbol}")

    print("\nIngestion complete.")


if __name__ == "__main__":
    run_ingestion()
