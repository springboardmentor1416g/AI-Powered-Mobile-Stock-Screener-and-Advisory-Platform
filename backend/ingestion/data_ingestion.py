import os
import json
import psycopg2
from datetime import datetime
from backend.services.market_data_service import MarketDataService

RAW_STORAGE_PATH = "storage/raw/"

def save_raw_json(symbol, data):
    """Save raw API response JSON for debugging and validation."""
    date_path = f"{RAW_STORAGE_PATH}/{datetime.now().strftime('%Y-%m-%d')}"
    os.makedirs(date_path, exist_ok=True)

    with open(f"{date_path}/{symbol}.json", "w") as f:
        json.dump(data, f, indent=4)

def insert_price_history(cursor, symbol, prices):
    """Insert normalized OHLCV data into TimescaleDB hypertable."""
    for entry in prices:
        cursor.execute("""
            INSERT INTO price_history (time, ticker, open, high, low, close, volume)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING;
        """, (
            entry["datetime"], symbol, entry["open"], entry["high"],
            entry["low"], entry["close"], entry["volume"]
        ))

def run_ingestion(symbols):
    """Run ingestion for a list of stock symbols."""

    conn = psycopg2.connect(
        host="localhost",
        database="stock_screener",
        user="postgres",
        password="postgres"
    )
    cursor = conn.cursor()

    for symbol in symbols:
        print(f"Fetching data for: {symbol}")

        # Step 1: Fetch historical price data
        price_data = MarketDataService.get_price_history(symbol)

        # Step 2: Save raw JSON to storage/raw/YYYY-MM-DD/
        save_raw_json(symbol, price_data)

        # Step 3: Insert normalized records
        if "values" in price_data:
            insert_price_history(cursor, symbol, price_data["values"])

    conn.commit()
    cursor.close()
    conn.close()

    print("Ingestion completed.")

if __name__ == "__main__":
    sample_symbols = ["AAPL", "MSFT", "GOOGL"]
    run_ingestion(sample_symbols)
