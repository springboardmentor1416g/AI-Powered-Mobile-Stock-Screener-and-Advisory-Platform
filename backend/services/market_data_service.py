import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env.dev")

API_KEY = os.getenv("MARKETDATA_API_KEY")
BASE_URL = os.getenv("MARKETDATA_BASE_URL")


def get_daily_ohlcv(symbol):
    """
    Fetch daily OHLCV time-series data from Alpha Vantage
    Uses TIME_SERIES_DAILY_ADJUSTED
    """
    params = {
        "function": "TIME_SERIES_DAILY_ADJUSTED",
        "symbol": symbol,
        "apikey": API_KEY,
        "outputsize": "compact"
    }

    response = requests.get(BASE_URL, params=params)
    data = response.json()

    if "Time Series (Daily)" not in data:
        print(f"Warning: No time series data returned for {symbol}")
        print("API response:", data)
        return {}

    return data["Time Series (Daily)"]


def get_company_metadata(symbol):
    """
    Fetch company metadata such as:
    name, exchange, sector, industry, market cap
    """
    params = {
        "function": "OVERVIEW",
        "symbol": symbol,
        "apikey": API_KEY
    }

    response = requests.get(BASE_URL, params=params)
    data = response.json()

    # Valid metadata must contain Symbol
    if not data or "Symbol" not in data:
        print(f"Warning: No metadata returned for {symbol}")
        print("API response:", data)
        return None

    return data
