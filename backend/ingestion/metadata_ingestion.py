import os
import psycopg2
from dotenv import load_dotenv

from backend.services.market_data_service import get_company_metadata

load_dotenv(".env.dev")

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}


def run_metadata_ingestion():
    print("Starting company metadata ingestion...")

    symbols = ["AAPL", "MSFT", "GOOGL", "IBM", "TSLA"]

    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    for symbol in symbols:
        data = get_company_metadata(symbol)
        if not data:
            continue

        cursor.execute("""
        INSERT INTO companies (
            ticker, name, exchange, sector, industry, market_cap
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (ticker) DO NOTHING;
        """, (
            data.get("Symbol"),
            data.get("Name"),
            data.get("Exchange"),
            data.get("Sector"),
            data.get("Industry"),
            data.get("MarketCapitalization")
        ))

        conn.commit()
        print(f"Inserted metadata for {symbol}")

    cursor.close()
    conn.close()
    print("Metadata ingestion completed!")


if __name__ == "__main__":
    run_metadata_ingestion()
