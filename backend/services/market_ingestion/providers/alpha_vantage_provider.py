import os
import time
import requests
from typing import Any, Dict, Optional


class AlphaVantageProvider:
    """
    Alpha Vantage Fundamental Data endpoints.
    Docs: https://www.alphavantage.co/documentation/
    """
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, sleep_s: float = 12.0):
        self.api_key = api_key or os.getenv("ALPHAVANTAGE_API_KEY") or os.getenv("MARKETDATA_API_KEY")
        if not self.api_key:
            raise RuntimeError("Missing ALPHAVANTAGE_API_KEY (or MARKETDATA_API_KEY) environment variable.")
        self.base_url = base_url or os.getenv("ALPHAVANTAGE_BASE_URL", "https://www.alphavantage.co/query")
        self.sleep_s = float(os.getenv("ALPHAVANTAGE_SLEEP_S", str(sleep_s)))  # free tier rate limiting safety

    def _get(self, params: Dict[str, Any]) -> Dict[str, Any]:
        params = dict(params)
        params["apikey"] = self.api_key

        resp = requests.get(self.base_url, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        # Alpha Vantage returns these on throttling / issues
        if "Note" in data:
            raise RuntimeError(f"AlphaVantage throttled: {data['Note']}")
        if "Error Message" in data:
            raise RuntimeError(f"AlphaVantage error: {data['Error Message']}")
        return data

    def income_statement(self, symbol: str) -> Dict[str, Any]:
        time.sleep(self.sleep_s)
        return self._get({"function": "INCOME_STATEMENT", "symbol": symbol})

    def balance_sheet(self, symbol: str) -> Dict[str, Any]:
        time.sleep(self.sleep_s)
        return self._get({"function": "BALANCE_SHEET", "symbol": symbol})

    def cash_flow(self, symbol: str) -> Dict[str, Any]:
        time.sleep(self.sleep_s)
        return self._get({"function": "CASH_FLOW", "symbol": symbol})

    def earnings(self, symbol: str) -> Dict[str, Any]:
        time.sleep(self.sleep_s)
        return self._get({"function": "EARNINGS", "symbol": symbol})