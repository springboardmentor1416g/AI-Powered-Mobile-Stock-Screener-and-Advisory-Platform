
market_data_service.py
Provider adapter (Alpha Vantage) for market metadata and historical daily OHLCV.

import os
import time
import requests
import logging
from typing import Dict, Any, List
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

LOG = logging.getLogger("market_data_service")
LOG.setLevel(os.getenv("LOG_LEVEL", "INFO"))

class AlphaVantageClient:
    def __init__(self, api_key: str, base_url: str = "https://www.alphavantage.co", rate_limit_per_min: int = 5):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.rate_limit_per_min = rate_limit_per_min
        self._last_call_ts = 0

    def _throttle(self):
        min_interval = 60.0 / max(1, self.rate_limit_per_min)
        elapsed = time.time() - self._last_call_ts
        if elapsed < min_interval:
            to_sleep = min_interval - elapsed
            LOG.debug("Throttling API calls: sleeping %.2fs", to_sleep)
            time.sleep(to_sleep)
        self._last_call_ts = time.time()

    @retry(wait=wait_exponential(multiplier=1, min=1, max=20), stop=stop_after_attempt(5))
    def _get(self, endpoint: str, params: Dict[str, Any]):
        self._throttle()
        params = params.copy()
        params['apikey'] = self.api_key
        url = f"{self.base_url}{endpoint}"
        resp = requests.get(url, params=params, timeout=30)
        if resp.status_code != 200:
            LOG.warning("Non-200 from API %s %s", resp.status_code, resp.text[:200])
            resp.raise_for_status()
        return resp.json()

    def get_company_overview(self, symbol: str) -> Dict[str, Any]:
        """
        Use AlphaVantage COMPANY_OVERVIEW endpoint to fetch metadata.
        """
        payload = self._get("/query", {"function": "OVERVIEW", "symbol": symbol})
        # payload is a dict of fields if present, or empty
        return payload

    def get_daily_adjusted(self, symbol: str, outputsize: str = "compact") -> Dict[str, Any]:
        """
        Returns TIME_SERIES_DAILY_ADJUSTED JSON.
        outputsize: 'compact' (latest 100) or 'full'
        """
        payload = self._get("/query", {"function": "TIME_SERIES_DAILY_ADJUSTED", "symbol": symbol, "outputsize": outputsize})
        return payload

# Factory to choose provider
def get_market_client(provider_name: str, api_key: str, base_url: str = None, rpm: int = 5):
    if provider_name.lower() in ("alphavantage", "alpha_vantage", "alpha"):
        return AlphaVantageClient(api_key, base_url or "https://www.alphavantage.co", rate_limit_per_min=rpm)
    else:
        raise ValueError(f"Unsupported provider: {provider_name}")

