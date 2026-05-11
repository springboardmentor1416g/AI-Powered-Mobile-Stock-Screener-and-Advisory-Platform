import os
import requests
from typing import Any, Dict, List, Optional


class FMPProvider:
    """
    FMP Stable API provider.
    Uses endpoints like:
      /stable/income-statement?symbol=AAPL
    """

    def __init__(self) -> None:
        self.api_key = os.getenv("FMP_API_KEY", "")
        self.base_url = os.getenv("FMP_BASE_URL", "https://financialmodelingprep.com/stable").rstrip("/")

        if not self.api_key:
            raise RuntimeError("FMP_API_KEY is missing. Set it in environment variables.")

    def _get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Any:
        url = f"{self.base_url}/{path.lstrip('/')}"
        q = params or {}
        q["apikey"] = self.api_key

        resp = requests.get(url, params=q, timeout=30)
        resp.raise_for_status()
        return resp.json()

    # ✅ Stable endpoints
    def income_statement(self, ticker: str, period: str, limit: int) -> List[Dict[str, Any]]:
        # period: "quarter" or "annual"
        return self._get("income-statement", {"symbol": ticker, "period": period, "limit": limit})

    def balance_sheet(self, ticker: str, period: str, limit: int) -> List[Dict[str, Any]]:
        return self._get("balance-sheet-statement", {"symbol": ticker, "period": period, "limit": limit})

    def cash_flow(self, ticker: str, period: str, limit: int) -> List[Dict[str, Any]]:
        return self._get("cash-flow-statement", {"symbol": ticker, "period": period, "limit": limit})

    def ratios(self, ticker: str, period: str, limit: int) -> List[Dict[str, Any]]:
        return self._get("ratios", {"symbol": ticker, "period": period, "limit": limit})

    def company_profile(self, ticker: str) -> Dict[str, Any]:
        data = self._get("profile", {"symbol": ticker})
        return data[0] if isinstance(data, list) and data else {}