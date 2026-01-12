import os
import requests

from dotenv import load_dotenv
load_dotenv("backend/.env")


API_KEY = os.getenv("MARKETDATA_API_KEY")
BASE_URL = os.getenv("MARKETDATA_BASE_URL")


def fetch_daily_prices(symbol):
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "apikey": API_KEY
    }
    response = requests.get(BASE_URL + "/query", params=params)
    response.raise_for_status()
    return response.json()

