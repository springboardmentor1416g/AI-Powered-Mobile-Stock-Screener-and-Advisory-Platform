<<<<<<< HEAD
import requests
import os

API_KEY = os.getenv("MARKETDATA_API_KEY", "DEMO_KEY")
BASE_URL = os.getenv("MARKETDATA_BASE_URL", "https://api.twelvedata.com")

class MarketDataService:

    @staticmethod
    def get_company_metadata(symbol):
        url = f"{BASE_URL}/quote?symbol={symbol}&apikey={API_KEY}"
        response = requests.get(url)
        return response.json()

    @staticmethod
    def get_price_history(symbol, interval="1day"):
        url = f"{BASE_URL}/time_series?symbol={symbol}&interval={interval}&apikey={API_KEY}"
        response = requests.get(url)
        return response.json()
=======
"""
Market Data Service

This file is responsible for talking to the external market data API.
For now, it only contains simple placeholder functions.
Later, it can be connected to a real provider like Alpha Vantage.
"""

import os
import requests  # used to call external APIs


API_KEY = os.getenv("MARKETDATA_API_KEY", "demo")
BASE_URL = os.getenv("MARKETDATA_BASE_URL", "https://www.alphavantage.co/query")


def fetch_daily_price_history(symbol: str):
    """
    Fetch daily price history for a given symbol.
    This uses Alpha Vantage TIME_SERIES_DAILY as an example.
    """
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "apikey": API_KEY,
        "outputsize": "compact",  # last ~100 days
    }

    response = requests.get(BASE_URL, params=params)
    response.raise_for_status()
    return response.json()


def fetch_company_overview(symbol: str):
    """
    Fetch basic company info such as name, sector, industry, etc.
    """
    params = {
        "function": "OVERVIEW",
        "symbol": symbol,
        "apikey": API_KEY,
    }

    response = requests.get(BASE_URL, params=params)
    response.raise_for_status()
    return response.json()
>>>>>>> 20c964eb79e44a212167787bd813f92b99b47c37
