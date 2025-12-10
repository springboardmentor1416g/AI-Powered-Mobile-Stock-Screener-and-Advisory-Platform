"""
Data Ingestion Script

This script:
1. Calls the market_data_service to get price history.
2. Saves the raw API response into storage/raw/YYYY-MM-DD/symbol.json
3. (Optionally) Inserts the data into the price_history table in PostgreSQL.

For now, this is a simple example for a few tickers.
"""

import os
import json
from datetime import datetime

import psycopg2  # used to connect to PostgreSQL

from backend.services.market_data_service import fetch_daily_price_history


# Database connection settings (from environment or defaults)
DB_NAME = os.getenv("DB_NAME", "stock_screener")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

RAW_BASE_DIR = os.path.join("storage", "raw")


def get_db_connection():
    """Create and return a PostgreSQL connection."""
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
    )
    return conn


def save_raw_json(symbol: str, data: dict):
    """
    Save raw JSON to storage/raw/YYYY-MM-DD/<symbol>.json
    """
    today = datetime.now().strftime("%Y-%m-%d")
    folder_path = os.path.join(RAW_BASE_DIR, today)
    os.makedirs(folder_path, exist_ok=True)

    file_path = os.path.join(folder_path, f"{symbol}.json")
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"[RAW] Saved raw data for {symbol} to {file_path}")


def insert_price_history(symbol: str, data: dict):
    """
    Parse Alpha Vantage TIME_SERIES_DAILY JSON and insert into price_history table.
    This assumes price_history(time, ticker, open, high, low, close, volume) exists.
    """
    time_series = data.get("Time Series (Daily)", {})

    conn = get_db_connection()
    cur = conn.cursor()

    for date_str, values in time_series.items():
        insert_query = """
        INSERT INTO price_history (time, ticker, open, high, low, close, volume)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (time, ticker) DO NOTHING;
        """
        cur.execute(
            insert_query,
            (
                date_str + " 09:15:00",           # timestamp
                symbol,
                float(values["1. open"]),
                float(values["2. high"]),
                float(values["3. low"]),
                float(values["4. close"]),
                int(float(values["5. volume"])),
            ),
        )

    conn.commit()
    cur.close()
    conn.close()
    print(f"[DB] Inserted price history rows for {symbol}")


def run_ingestion():
    """
    Run ingestion for a small list of symbols.
    """
    symbols = ["AAPL", "MSFT", "GOOGL"]  # example tickers

    for symbol in symbols:
        print(f"=== Ingesting {symbol} ===")
        data = fetch_daily_price_history(symbol)
        save_raw_json(symbol, data)
        insert_price_history(symbol, data)

    print("Ingestion complete.")


if __name__ == "__main__":
    run_ingestion()
