"""
Yahoo Finance fallback when FMP has no data (402, empty, or missing tickers).
All tickers are listed and active; "possibly delisted" / "no timezone found" are
Yahoo bot-protection false positives. We suppress those and use a browser-like
session when available.
"""

import logging
import warnings
from datetime import datetime, timedelta

# Suppress yfinance false "possibly delisted" / "no timezone found" messages
# (Yahoo rate-limit/bot-protection triggers these for valid, listed tickers)
warnings.filterwarnings("ignore", message=".*possibly delisted.*")
warnings.filterwarnings("ignore", message=".*no timezone found.*")
warnings.filterwarnings("ignore", message=".*No timezone found.*")
logging.getLogger("yfinance").setLevel(logging.WARNING)

try:
    import yfinance as yf
except ImportError:
    yf = None

# Optional: browser-impersonating session to bypass Yahoo bot protection
_yf_session = None
try:
    from curl_cffi import requests as curl_requests
    _yf_session = curl_requests.Session(impersonate="chrome", timeout=15)
except ImportError:
    pass


def _ensure_yf():
    if yf is None:
        raise ImportError("yfinance not installed. Run: pip install yfinance")


def _get_close_series(data, ticker):
    """Extract Close column from yfinance DataFrame (handles multi-level columns)."""
    try:
        col = data["Close"]
    except (KeyError, TypeError):
        for c in data.columns:
            if isinstance(c, tuple) and c[0] == "Close":
                col = data[c]
                break
        else:
            return None
    if hasattr(col, "squeeze"):
        col = col.squeeze()
    return col.dropna()


def get_quote(ticker: str) -> dict | None:
    """
    Get current quote for a ticker via yfinance.
    Returns dict with: symbol, price, previousClose, change, changePercentage
    (matching FMP quote shape for compatibility).
    """
    _ensure_yf()
    try:
        kwargs = {"progress": False, "threads": False, "auto_adjust": True, "ignore_tz": True}
        if _yf_session is not None:
            kwargs["session"] = _yf_session
        data = yf.download(ticker, period="5d", **kwargs)
        if data is None or data.empty or len(data) < 2:
            return None
        closes = _get_close_series(data, ticker)
        if closes is None or len(closes) < 2:
            return None
        current = float(closes.iloc[-1])
        prev_close = float(closes.iloc[-2])
        daily_change = ((current - prev_close) / prev_close) * 100
        return {
            "symbol": ticker,
            "price": current,
            "previousClose": prev_close,
            "change": current - prev_close,
            "changePercentage": daily_change,
        }
    except Exception:
        return None


def _get_row_val(row, key, default=0):
    """Extract value from row (handles multi-level columns like ('Close', 'AAPL'))."""
    for c in row.index:
        if c == key or (isinstance(c, tuple) and c[0] == key):
            return float(row[c])
    return float(default)


def get_historical_eod(ticker: str, from_date: str, to_date: str) -> list[dict]:
    """
    Get historical EOD data for a ticker via yfinance.
    Returns list of dicts with: date, open, high, low, close (matching FMP shape).
    """
    _ensure_yf()
    try:
        kwargs = {
            "start": from_date,
            "end": to_date,
            "progress": False,
            "threads": False,
            "auto_adjust": True,
            "ignore_tz": True,
            "timeout": 15,
        }
        if _yf_session is not None:
            kwargs["session"] = _yf_session
        data = yf.download(ticker, **kwargs)
        if data is None or data.empty:
            return []
        rows = []
        for idx, row in data.iterrows():
            date_str = idx.strftime("%Y-%m-%d") if hasattr(idx, "strftime") else str(idx)[:10]
            close_val = _get_row_val(row, "Close", 0)
            rows.append({
                "date": date_str,
                "open": _get_row_val(row, "Open", close_val),
                "high": _get_row_val(row, "High", close_val),
                "low": _get_row_val(row, "Low", close_val),
                "close": close_val,
            })
        rows.sort(key=lambda r: r["date"], reverse=True)
        return rows
    except Exception:
        return []
