import json
import os
from datetime import datetime
from services.market_data_service import get_stock_metadata, get_daily_prices

RAW_PATH = "storage/raw"

def save_raw_data(symbol, data):
    date_folder = datetime.now().strftime("%Y-%m-%d")
    path = f"{RAW_PATH}/{date_folder}"
    os.makedirs(path, exist_ok=True)

    with open(f"{path}/{symbol}.json", "w") as f:
        json.dump(data, f)

def ingest_stock(symbol):
    metadata = get_stock_metadata(symbol)
    prices = get_daily_prices(symbol)

    save_raw_data(symbol, {
        "metadata": metadata,
        "prices": prices
    })

if __name__ == "__main__":
    symbols = ["AAPL", "MSFT", "GOOGL"]
    for sym in symbols:
        ingest_stock(sym)
        print(f"Ingested {sym}")
