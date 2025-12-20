import os
from datetime import datetime

import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv
import yfinance as yf


# Load environment variables from .env.dev
load_dotenv(".env.dev")

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}

# List of stock tickers to ingest
TICKERS = ["AAPL", "MSFT", "GOOGL", "IBM", "TSLA", 'TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS', 'TECHM.NS',
        'LTIM.NS', 'RELIANCE.NS', 'HDFCBANK.NS', 'ICICIBANK.NS',
        'BHARTIARTL.NS', 'ITC.NS', 'KOTAKBANK.NS', 'LT.NS',
        'AXISBANK.NS', 'SBIN.NS', 'BAJFINANCE.NS', 'ASIANPAINT.NS',
        'MARUTI.NS', 'TITAN.NS', 'SUNPHARMA.NS']


def get_db_connection():
    """Create and return a PostgreSQL database connection."""
    return psycopg2.connect(**DB_CONFIG)


def fetch_company_metadata(ticker):
    """
    Fetch company metadata using Yahoo Finance.
    Returns a dictionary containing basic company details.
    """
    stock = yf.Ticker(ticker)
    info = stock.info

    if not info or "symbol" not in info:
        print(f"No metadata found for {ticker}")
        return None

    return {
        "ticker": ticker,
        "name": info.get("longName"),
        "exchange": info.get("exchange"),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "market_cap": info.get("marketCap"),
    }


def fetch_price_history(ticker):
    """
    Fetch daily OHLCV price history for the last 6 months.
    Returns a list of tuples ready for database insertion.
    """
    stock = yf.Ticker(ticker)
    df = stock.history(period="6mo", interval="1d")

    if df.empty:
        print(f"No price data found for {ticker}")
        return []

    records = []
    for date, row in df.iterrows():
        records.append((
            date.to_pydatetime(),
            ticker,
            float(row["Open"]),
            float(row["High"]),
            float(row["Low"]),
            float(row["Close"]),
            int(row["Volume"]),
        ))

    return records


def run_ingestion():
    """
    Main ingestion pipeline.
    Inserts company metadata and historical price data into the database.
    """
    print("Starting data ingestion pipeline")

    conn = get_db_connection()
    cursor = conn.cursor()

    for ticker in TICKERS:
        print(f"Processing ticker: {ticker}")

        # Insert or update company metadata
        metadata = fetch_company_metadata(ticker)
        if metadata:
            cursor.execute(
                """
                INSERT INTO companies (ticker, name, exchange, sector, industry, market_cap)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (ticker) DO UPDATE
                SET
                    name = EXCLUDED.name,
                    exchange = EXCLUDED.exchange,
                    sector = EXCLUDED.sector,
                    industry = EXCLUDED.industry,
                    market_cap = EXCLUDED.market_cap;
                """,
                (
                    metadata["ticker"],
                    metadata["name"],
                    metadata["exchange"],
                    metadata["sector"],
                    metadata["industry"],
                    metadata["market_cap"],
                )
            )
            conn.commit()
            print(f"Metadata stored for {ticker}")

        # Insert historical price data
        price_records = fetch_price_history(ticker)
        if not price_records:
            print(f"No price records to insert for {ticker}")
            continue

        execute_batch(
            cursor,
            """
            INSERT INTO price_history (time, ticker, open, high, low, close, volume)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING;
            """,
            price_records
        )

        conn.commit()
        print(f"Inserted {len(price_records)} price rows for {ticker}")

    cursor.close()
    conn.close()

    print("Data ingestion completed successfully")


if __name__ == "__main__":
    run_ingestion()


# Command to run:
# python -m backend.ingestion.data_ingestion
