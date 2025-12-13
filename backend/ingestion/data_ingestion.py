import os
import json
from datetime import datetime
import requests
import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env.dev")

# DB Configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}

# Alpha Vantage Config
API_KEY = os.getenv("MARKETDATA_API_KEY")
BASE_URL = os.getenv("MARKETDATA_BASE_URL")

RAW_BASE_PATH = "storage/raw"

# Ensure folder exists
def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

# Search supported symbols via Alpha Vantage
def symbol_search(keyword):
    url = f"{BASE_URL}?function=SYMBOL_SEARCH&keywords={keyword}&apikey={API_KEY}"
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Error searching symbol {keyword}: {response.text}")
        return []
    results = response.json().get("bestMatches", [])
    symbols = [match["1. symbol"] for match in results]
    return symbols

# Fetch daily OHLCV data
def get_daily_ohlcv(symbol):
    url = f"{BASE_URL}?function=TIME_SERIES_DAILY&symbol={symbol}&outputsize=compact&apikey={API_KEY}"
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Error fetching {symbol}: {response.text}")
        return {}
    json_response = response.json()
    # Check for API errors
    if "Error Message" in json_response:
        print(f"API Error for {symbol}: {json_response['Error Message']}")
        return {}
    if "Information" in json_response:
        print(f"API Info for {symbol}: {json_response['Information']}")
        return {}
    data = json_response.get("Time Series (Daily)", {})
    if not data:
        print(f"Warning: No time series data returned for {symbol}")
    return data

# Main ingestion pipeline
def run_ingestion():
    print("Starting market data ingestion...")

    # Sample tickers to test ingestion (US stocks supported by Alpha Vantage)
    tickers = ["AAPL", "MSFT", "GOOGL", "IBM", "TSLA"]
    today = datetime.now().strftime("%Y-%m-%d")
    raw_path = os.path.join(RAW_BASE_PATH, today)
    ensure_dir(raw_path)

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
    except Exception as e:
        print("Database connection failed:", e)
        return

    for ticker in tickers:
        print(f"Fetching data for {ticker}...")

        # Check if symbol is supported
        search_results = symbol_search(ticker)
        if ticker not in search_results:
            print(f"No supported symbol found for {ticker}, skipping.")
            continue

        data = get_daily_ohlcv(ticker)
        if not data:
            print(f"No data returned for {ticker}, skipping insertion.")
            continue

        # Save raw JSON
        raw_file = os.path.join(raw_path, f"{ticker}.json")
        with open(raw_file, "w") as f:
            json.dump(data, f, indent=2)

        # Prepare records for DB insertion
        records = []
        for date_str, values in data.items():
            try:
                records.append((
                    date_str,
                    ticker,
                    float(values["1. open"]),
                    float(values["2. high"]),
                    float(values["3. low"]),
                    float(values["4. close"]),
                    int(values["5. volume"]),
                ))
            except KeyError:
                # Skip if values are missing
                continue

        if records:
            insert_sql = """
                INSERT INTO price_history (time, ticker, open, high, low, close, volume)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING;
            """
            execute_batch(cursor, insert_sql, records)
            conn.commit()
            print(f"Inserted {len(records)} rows for {ticker}")
        else:
            print(f"No valid records for {ticker}, skipping insertion.")

    cursor.close()
    conn.close()
    print("Ingestion completed successfully!")

if __name__ == "__main__":
    run_ingestion()

# Command to run the ingestion:
# python backend/ingestion/data_ingestion.py