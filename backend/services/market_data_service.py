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
