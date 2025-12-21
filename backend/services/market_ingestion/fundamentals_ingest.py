import requests
import os
import json
from datetime import datetime

# Load environment variables
API_KEY = os.getenv("MARKETDATA_API_KEY")
BASE_URL = os.getenv("MARKETDATA_BASE_URL")

def fetch_fundamentals(symbol):
    """
    Fetch fundamentals data for a given stock symbol
    """
    url = f"{BASE_URL}/fundamentals/{symbol}"
    params = {
        "apikey": API_KEY
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fetch fundamentals for {symbol}")

def save_raw_data(symbol, data):
    """
    Save raw fundamentals data to storage
    """
    folder = "storage/raw/fundamentals"
    os.makedirs(folder, exist_ok=True)

    file_path = f"{folder}/{symbol}_{datetime.now().date()}.json"

    with open(file_path, "w") as f:
        json.dump(data, f, indent=4)

    print(f"Fundamentals data saved: {file_path}")

def run_fundamentals_ingestion(symbol):
    data = fetch_fundamentals(symbol)
    save_raw_data(symbol, data)

if __name__ == "__main__":
    run_fundamentals_ingestion("AAPL")
