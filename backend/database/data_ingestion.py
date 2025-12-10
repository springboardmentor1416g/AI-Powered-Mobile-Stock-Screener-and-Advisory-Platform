"""
data_ingestion.py
Main ingestion pipeline that:
- reads a list of tickers
- fetches company overview (metadata) and daily OHLCV
- stores raw JSON to disk: /storage/raw/YYYY-MM-DD/provider/<symbol>.json
- inserts/updates companies table and price_history hypertable
"""

import os
import json
import logging
import argparse
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

from backend.services.market_data_service import get_market_client

LOG = logging.getLogger("data_ingestion")
LOG.setLevel(os.getenv("LOG_LEVEL", "INFO"))

load_dotenv()  # read .env

DATABASE_URL = os.getenv("DATABASE_URL")
PROVIDER = os.getenv("MARKETDATA_PROVIDER", "alphavantage")
API_KEY = os.getenv("MARKETDATA_API_KEY")
BASE_URL = os.getenv("MARKETDATA_BASE_URL")
RAW_PATH = os.getenv("RAW_STORAGE_PATH", "./storage/raw")
BATCH = int(os.getenv("INGEST_BATCH_SIZE", "10"))
REQUESTS_PER_MIN = int(os.getenv("REQUESTS_PER_MINUTE", "5"))

# Ensure raw path exists
Path(RAW_PATH).mkdir(parents=True, exist_ok=True)

def save_raw(provider: str, symbol: str, payload: Dict[str, Any]):
    datepath = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    out_dir = Path(RAW_PATH) / datepath / provider
    out_dir.mkdir(parents=True, exist_ok=True)
    filename = out_dir / f"{symbol}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(payload, f, default=str)
    LOG.info("Saved raw payload to %s", filename)

def transform_and_upsert_company(conn, overview: Dict[str, Any]):
    """
    Map provider fields to companies table columns (ticker, name, sector, industry, exchange, market_cap).
    Alpha Vantage overview fields: Symbol, Name, Exchange, Sector, Industry, MarketCapitalization
    """
    if not overview:
        return
    ticker = overview.get("Symbol") or overview.get("symbol")
    name = overview.get("Name") or overview.get("name")
    exchange = overview.get("Exchange") or overview.get("exchange")
    sector = overview.get("Sector") or overview.get("sector")
    industry = overview.get("Industry") or overview.get("industry")
    market_cap = overview.get("MarketCapitalization") or overview.get("market_cap") or None
    try:
        market_cap = int(market_cap) if market_cap else None
    except Exception:
        market_cap = None

    sql = """
    INSERT INTO companies (ticker, name, sector, industry, exchange, market_cap, created_at)
    VALUES %s
    ON CONFLICT (ticker) DO UPDATE
      SET name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          industry = EXCLUDED.industry,
          exchange = EXCLUDED.exchange,
          market_cap = EXCLUDED.market_cap;
    """
    vals = [(ticker, name, sector, industry, exchange, market_cap, datetime.now(timezone.utc))]
    with conn.cursor() as cur:
        execute_values(cur, sql, vals)
    conn.commit()
    LOG.debug("Upserted company %s", ticker)

def transform_and_insert_price_history(conn, symbol: str, ts_payload: Dict[str, Any]):
    """
    ts_payload should be the TIME_SERIES_DAILY_ADJUSTED result JSON
    AlphaVantage returns key "Time Series (Daily)" with nested timestamps
    We'll insert rows into price_history (time, ticker, open, high, low, close, volume, adj_close)
    """
    # Identify the time series node
    if not ts_payload:
        return 0
    # Support both keys
    series = None
    for key in ("Time Series (Daily)", "Time Series (Digital)", "Time Series (Intraday)"):
        if key in ts_payload:
            series = ts_payload[key]
            break
    # fallback: try first key with dict of dates
    if series is None:
        for k, v in ts_payload.items():
            if isinstance(v, dict):
                # likely the timeseries node
                series = v
                break
    if not series:
        LOG.warning("No time series found in payload for %s", symbol)
        return 0

    rows = []
    for ts, metrics in series.items():
        # ts is date string YYYY-MM-DD
        try:
            dt = datetime.fromisoformat(ts)
        except Exception:
            # Try parsing with dateutil
            from dateutil.parser import parse
            dt = parse(ts)
        open_p = metrics.get("1. open") or metrics.get("open")
        high = metrics.get("2. high") or metrics.get("high")
        low = metrics.get("3. low") or metrics.get("low")
        close = metrics.get("4. close") or metrics.get("close")
        adj_close = metrics.get("5. adjusted close") or metrics.get("5. adjusted close".lower()) or metrics.get("adjusted close") or metrics.get("adj_close")
        volume = metrics.get("6. volume") or metrics.get("volume")

        # normalize numeric types
        def to_num(x):
            try:
                return float(x) if x is not None and x != "" else None
            except:
                return None
        def to_int(x):
            try:
                return int(float(x)) if x is not None and x != "" else None
            except:
                return None

        rows.append((dt, symbol, to_num(open_p), to_num(high), to_num(low), to_num(close), to_int(volume), to_num(adj_close)))

    # Bulk insert with ON CONFLICT DO UPDATE (so re-ingests update)
    insert_sql = """
    INSERT INTO price_history (time, ticker, open, high, low, close, volume, adj_close)
    VALUES %s
    ON CONFLICT (time, ticker) DO UPDATE SET
      open = EXCLUDED.open,
      high = EXCLUDED.high,
      low = EXCLUDED.low,
      close = EXCLUDED.close,
      volume = EXCLUDED.volume,
      adj_close = EXCLUDED.adj_close;
    """
    with conn.cursor() as cur:
        execute_values(cur, insert_sql, rows, page_size=500)
    conn.commit()
    LOG.info("Inserted/Updated %d rows for %s", len(rows), symbol)
    return len(rows)

def run_ingest(tickers: list, outputsize: str = "compact"):
    client = get_market_client(PROVIDER, API_KEY, BASE_URL, rpm=REQUESTS_PER_MIN)
    conn = psycopg2.connect(DATABASE_URL)
    total = 0
    for idx, symbol in enumerate(tickers, 1):
        symbol = symbol.strip().upper()
        LOG.info("Processing %d/%d: %s", idx, len(tickers), symbol)
        try:
            # 1) Get metadata
            overview = client.get_company_overview(symbol)
            save_raw(PROVIDER, f"{symbol}_overview", overview)
            transform_and_upsert_company(conn, overview)

            # 2) Get daily adjusted time series
            ts = client.get_daily_adjusted(symbol, outputsize=outputsize)
            save_raw(PROVIDER, symbol, ts)
            rows = transform_and_insert_price_history(conn, symbol, ts)
            total += rows
        except Exception as e:
            LOG.exception("Error ingesting %s: %s", symbol, e)
    conn.close()
    LOG.info("Finished ingestion. Total rows inserted: %d", total)
    return total

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Market data ingestion pipeline")
    parser.add_argument("--tickers-file", help="Path to newline-separated tickers file", required=True)
    parser.add_argument("--outputsize", default="compact", choices=("compact","full"), help="AlphaVantage outputsize")
    args = parser.parse_args()
    with open(args.tickers_file) as f:
        tickers = [l.strip() for l in f if l.strip()]
    run_ingest(tickers, outputsize=args.outputsize)
