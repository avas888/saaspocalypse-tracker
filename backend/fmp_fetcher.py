"""
FMP (Financial Modeling Prep) API client for stock price data.
Used by fetch_prices.py for daily snapshots, baseline, backfill, and LTM high.
"""

import os
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (parent of backend/)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


class FMPFetcher:
    BASE_URL = "https://financialmodelingprep.com/stable"

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("FMP_API_KEY")
        if not self.api_key:
            raise ValueError("FMP API Key is missing. Set FMP_API_KEY in .env or pass to constructor.")

    def _fetch_json(self, endpoint: str, params: dict = None):
        """
        Fetch JSON data from FMP Stable API with error handling.
        """
        if params is None:
            params = {}

        params["apikey"] = self.api_key
        url = f"{self.BASE_URL}/{endpoint}"

        try:
            r = requests.get(url, params=params, timeout=30)
            r.raise_for_status()

            data = r.json()

            # Check for FMP-specific error messages in OK responses
            if isinstance(data, dict) and "Error Message" in data:
                error_msg = data["Error Message"]
                if "upgrade" in error_msg.lower():
                    raise PermissionError(f"Plan Upgrade Required: {error_msg}")
                raise ValueError(f"FMP API Error: {error_msg}")

            return data

        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 403:
                print(f"[ERROR] 403 Forbidden accessing {endpoint}. Check API key permissions.")
            elif e.response.status_code == 429:
                print(f"[ERROR] 429 Rate Limit Exceeded accessing {endpoint}.")
            raise
        except Exception as e:
            print(f"[ERROR] Failed to fetch {url}: {e}")
            raise

    def get_quote(self, symbol: str) -> dict | None:
        """Get real-time quote for a single symbol. Returns first item or None."""
        data = self._fetch_json("quote", params={"symbol": symbol})
        if isinstance(data, list) and data:
            return data[0]
        return None

    def get_batch_quote(self, symbols: list[str]) -> list[dict]:
        """
        Get real-time quotes for multiple symbols.
        Tries batch-quote first; falls back to single quote per symbol if 402 (premium).
        Returns list of quote objects (one per symbol).
        """
        symbols_str = ",".join(symbols)
        try:
            data = self._fetch_json("batch-quote", params={"symbols": symbols_str})
            if isinstance(data, list):
                return data
        except requests.exceptions.HTTPError as e:
            if hasattr(e, "response") and e.response is not None and e.response.status_code == 402:
                # batch-quote is premium on free plan; fall back to single quote per symbol
                results = []
                for sym in symbols:
                    q = self.get_quote(sym)
                    if q:
                        results.append(q)
                return results
            raise
        return []

    def get_historical_eod(self, symbol: str, from_date: str, to_date: str) -> list[dict]:
        """
        Get historical end-of-day OHLC data for a symbol.
        from_date, to_date: YYYY-MM-DD strings.
        Returns list of daily bars, newest first.
        """
        data = self._fetch_json(
            "historical-price-eod/full",
            params={"symbol": symbol, "from": from_date, "to": to_date},
        )
        if isinstance(data, list):
            return data
        return []
