# backend/services/market_data_service.py
"""
Utilities for market data ingestion:
 - DB connection (SQLAlchemy + psycopg2)
 - save_raw_json(ticker, payload, base_dir)
 - upsert_price_history(df, source='yfinance')

Assumes Postgres on localhost:5432, database 'stock_screener', user 'postgres', password 'Ankit#123'.
"""

import os
import json
from datetime import datetime
import pandas as pd
from sqlalchemy import create_engine, text

# DB config (local)
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASS = os.environ.get("DB_PASS", "Ankit#123")
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME", "stock_screener")

ENGINE = create_engine(
    f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
    pool_pre_ping=True,
    pool_size=5
)

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)
    return path

def save_raw_json(ticker: str, payload, base_dir="storage/raw"):
    """
    Save raw payload (JSON-serializable) to storage/raw/YYYY-MM-DD/TICKER_raw.json
    """
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    path = ensure_dir(os.path.join(base_dir, date_str))
    filename = os.path.join(path, f"{ticker}_raw.json")
    with open(filename, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, default=str, indent=2)
    return filename

def upsert_price_history(df: pd.DataFrame, source="yfinance"):
    """
    df columns expected: ['ticker', 'time', 'open', 'high', 'low', 'close', 'adjclose', 'volume']
    Performs batch upsert into price_history.
    """
    if df.empty:
        return 0
    # convert to list of tuples
    records = []
    for _, row in df.iterrows():
        records.append((
            row['ticker'],
            row['time'].to_pydatetime() if hasattr(row['time'], 'to_pydatetime') else row['time'],
            float(row['open']) if row['open'] is not None else None,
            float(row['high']) if row['high'] is not None else None,
            float(row['low']) if row['low'] is not None else None,
            float(row['close']) if row['close'] is not None else None,
            float(row.get('adjclose') or row.get('adjusted_close') or row['close']) if row.get('close') is not None else None,
            int(row['volume']) if row['volume'] is not None else None,
            source
        ))

    insert_sql = """
    INSERT INTO price_history (ticker, time, open, high, low, close, adjusted_close, volume, source)
    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
    ON CONFLICT DO NOTHING
    """
    conn = ENGINE.raw_connection()
    try:
        cur = conn.cursor()
        cur.executemany(insert_sql, records)
        conn.commit()
        rowcount = cur.rowcount
        cur.close()
        return rowcount
    finally:
        conn.close()

def upsert_company_metadata(ticker: str, name: str = None, exchange: str = None, currency: str = None, sector: str = None, industry: str = None):
    """Insert or update company metadata."""
    upsert_sql = text("""
    INSERT INTO companies (ticker, name, exchange, currency, sector, industry)
    VALUES (:ticker, :name, :exchange, :currency, :sector, :industry)
    ON CONFLICT (ticker) DO UPDATE
      SET name = COALESCE(EXCLUDED.name, companies.name),
          exchange = COALESCE(EXCLUDED.exchange, companies.exchange),
          currency = COALESCE(EXCLUDED.currency, companies.currency),
          sector = COALESCE(EXCLUDED.sector, companies.sector),
          industry = COALESCE(EXCLUDED.industry, companies.industry)
    """)
    with ENGINE.begin() as conn:
        conn.execute(upsert_sql, {"ticker": ticker, "name": name, "exchange": exchange, "currency": currency, "sector": sector, "industry": industry})
