import json
import os
import psycopg2
from datetime import date
from backend.services.market_data_service import fetch_daily_prices

SYMBOLS = ["TCS", "INFY"]

RAW_DIR = f"storage/raw/{date.today()}"

os.makedirs(RAW_DIR, exist_ok=True)

conn = psycopg2.connect(
    host="localhost",
    database="stock_screener",
    user="postgres",
    password="kanan40/80"
)
cur = conn.cursor()

for symbol in SYMBOLS:
    data = fetch_daily_prices(symbol)

    # Save raw JSON
    with open(f"{RAW_DIR}/{symbol}.json", "w") as f:
        json.dump(data, f, indent=2)

    timeseries = data.get("Time Series (Daily)", {})
    for day, values in timeseries.items():
        cur.execute("""
            INSERT INTO price_history (time, ticker, open, high, low, close, volume)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            day,
            symbol,
            values["1. open"],
            values["2. high"],
            values["3. low"],
            values["4. close"],
            values["5. volume"]
        ))

conn.commit()
cur.close()
conn.close()

print(f"Fetching data for {symbol}")
print(f"Saving raw data for {symbol}")
print(f"Inserting price data for {symbol}")
