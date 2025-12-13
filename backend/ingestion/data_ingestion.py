import os
import json
from datetime import datetime
import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv

from backend.services.market_data_service import get_daily_ohlcv

load_dotenv(".env.dev")

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}

RAW_BASE_PATH = "storage/raw"


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


def run_price_ingestion():
    print("Starting market price ingestion...")

    tickers = [
        "INFY.NS",
        "TCS.NS",
        "RELIANCE.NS",
        "HDFCBANK.NS",
        "ICICIBANK.NS",
    ]

    today = datetime.now().strftime("%Y-%m-%d")
    raw_path = os.path.join(RAW_BASE_PATH, today)
    ensure_dir(raw_path)

    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    insert_sql = """
        INSERT INTO price_history
        (time, ticker, open, high, low, close, volume)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT DO NOTHING;
    """

    for ticker in tickers:
        print(f"Fetching price data for {ticker}...")
        data = get_daily_ohlcv(ticker)

        if not data:
            print(f"No data for {ticker}, skipping.")
            continue

        # Save raw JSON
        with open(os.path.join(raw_path, f"{ticker}.json"), "w") as f:
            json.dump(data, f, indent=2)

        records = []
        for date_str, values in data.items():
            records.append(
                (
                    date_str,
                    ticker,
                    values["open"],
                    values["high"],
                    values["low"],
                    values["close"],
                    values["volume"],
                )
            )

        execute_batch(cursor, insert_sql, records)
        conn.commit()

        print(f"Inserted {len(records)} rows for {ticker}")

    cursor.close()
    conn.close()
    print("Price ingestion completed.")


if __name__ == "__main__":
    run_price_ingestion()