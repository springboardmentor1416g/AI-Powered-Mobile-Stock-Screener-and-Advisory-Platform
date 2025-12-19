import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("MARKETDATA_API_KEY")
BASE_URL = os.getenv("MARKETDATA_BASE_URL")

def get_stock_metadata(symbol):
    url = f"{BASE_URL}/query"
    params = {
        "function": "OVERVIEW",
        "symbol": symbol,
        "apikey": API_KEY
    }
    response = requests.get(url, params=params)
    return response.json()

def get_daily_prices(symbol):
    url = f"{BASE_URL}/query"
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "apikey": API_KEY
    }
    response = requests.get(url, params=params)
    return response.json()
