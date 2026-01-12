import yfinance as yf
import pandas as pd
import psycopg2
from datetime import datetime

import logging
logging.basicConfig(filename="logs/fundamentals_ingestion.log", level=logging.INFO)

logging.info(f"Ingested fundamentals for {symbol}")

import pandas as pd

def clean_value(value):
    if pd.isna(value):
        return None
    return float(value)

SYMBOLS = ["TCS.NS", "INFY.NS"]

conn = psycopg2.connect(
    host="localhost",
    database="stock_screener",
    user="postgres",
    password="kanan40/80"
)
cur = conn.cursor()

for symbol in SYMBOLS:
    ticker_symbol = symbol.replace(".NS", "")
    ticker = yf.Ticker(symbol)

    quarterly = ticker.quarterly_financials

    cur.execute("""
        INSERT INTO companies (ticker, name, exchange)
        VALUES (%s, %s, %s)
        ON CONFLICT (ticker) DO NOTHING
    """, (
        ticker_symbol,
        ticker_symbol,
        "NSE"
    ))

    for col in quarterly.columns:
        cur.execute("""
            INSERT INTO fundamentals_quarterly
            (ticker, quarter, revenue, net_income)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            ticker_symbol,
            col.strftime("%Y-%m-%d"),
            clean_value(quarterly.loc["Total Revenue"].get(col)),
            clean_value(quarterly.loc["Net Income"].get(col))
        ))

conn.commit()
cur.close()
conn.close()

print("Fundamental ingestion complete")
