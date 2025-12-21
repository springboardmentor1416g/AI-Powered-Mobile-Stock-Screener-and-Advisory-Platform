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
