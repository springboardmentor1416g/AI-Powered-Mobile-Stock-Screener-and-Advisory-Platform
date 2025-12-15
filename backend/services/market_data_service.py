import os
import requests
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

API_KEY = os.getenv("KID7XIUHTNX4YLG0")
BASE_URL = os.getenv("MARKETDATA_BASE_URL")

def fetch_daily_prices(symbol):
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "apikey": API_KEY
    }

    response = requests.get(f"{BASE_URL}/query", params=params)

    if response.status_code != 200:
        raise Exception("Failed to fetch market data")

    return response.json()
