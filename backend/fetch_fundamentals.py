#!/usr/bin/env python3
"""
SaaSpocalypse Fundamentals Fetcher
Fetches ARR Multiple (EV / TTM Revenue) and Rule of 40 (Revenue Growth % + EBITDA Margin %)
for all tracked public companies via Yahoo Finance.

Run: python fetch_fundamentals.py
Or:  npm run fetch:fundamentals
"""

import json
import sys
import time
import logging
import warnings
from datetime import datetime
from pathlib import Path

warnings.filterwarnings("ignore", message=".*possibly delisted.*")
warnings.filterwarnings("ignore", message=".*no timezone found.*")
warnings.filterwarnings("ignore", message=".*No timezone found.*")
logging.getLogger("yfinance").setLevel(logging.WARNING)

try:
    import yfinance as yf
except ImportError:
    print("yfinance not installed. Run: pip install yfinance")
    sys.exit(1)

_yf_session = None
try:
    from curl_cffi import requests as curl_requests
    _yf_session = curl_requests.Session(impersonate="chrome", timeout=15)
except ImportError:
    pass

TICKERS = {
    "HUBS":     {"name": "HubSpot",                "sector": "crm"},
    "MNDY":     {"name": "monday.com",              "sector": "crm"},
    "CRM":      {"name": "Salesforce",              "sector": "crm"},
    "FRSH":     {"name": "Freshworks",              "sector": "crm"},
    "ASAN":     {"name": "Asana",                   "sector": "project"},
    "SMAR":     {"name": "Smartsheet",              "sector": "project"},
    "INTU":     {"name": "Intuit",                  "sector": "accounting"},
    "XRO.AX":   {"name": "Xero",                   "sector": "accounting"},
    "SGE.L":    {"name": "Sage Group",              "sector": "accounting"},
    "TOTS3.SA": {"name": "TOTVS",                   "sector": "accounting"},
    "4478.T":   {"name": "freee",                   "sector": "accounting"},
    "ADP":      {"name": "ADP",                     "sector": "payroll"},
    "PAYX":     {"name": "Paychex",                 "sector": "payroll"},
    "PAYC":     {"name": "Paycom",                  "sector": "payroll"},
    "PCTY":     {"name": "Paylocity",               "sector": "payroll"},
    "XYZ":      {"name": "Block (Square)",          "sector": "payroll"},
    "TOST":     {"name": "Toast",                   "sector": "pos"},
    "LSPD":     {"name": "Lightspeed",              "sector": "pos"},
    "FI":       {"name": "Fiserv (Clover)",         "sector": "pos"},
    "DASH":     {"name": "DoorDash (Otter)",        "sector": "pos"},
    "AGYS":     {"name": "Agilysys",                "sector": "hotel"},
    "SABR":     {"name": "Sabre",                   "sector": "hotel"},
    "SDR.AX":   {"name": "SiteMinder",              "sector": "hotel"},
    "DOCU":     {"name": "DocuSign",                "sector": "document"},
    "DBX":      {"name": "Dropbox",                 "sector": "document"},
    "SHOP":     {"name": "Shopify",                 "sector": "ecommerce"},
    "BIGC":     {"name": "BigCommerce",             "sector": "ecommerce"},
    "WIX":      {"name": "Wix",                     "sector": "ecommerce"},
    "SQSP":     {"name": "Squarespace",             "sector": "ecommerce"},
    "VTEX":     {"name": "VTEX",                    "sector": "ecommerce"},
    "CSU.TO":   {"name": "Constellation Software",  "sector": "consolidators"},
    "ASUR":     {"name": "Asure Software",          "sector": "consolidators"},
    "UPLD":     {"name": "Upland Software",         "sector": "consolidators"},
}

DATA_DIR = Path(__file__).parent.parent / "data"
DELAY_BETWEEN_TICKERS = 0.5


def _fmt_large(val):
    """Format large numbers as $X.XB or $X.XM."""
    if val is None:
        return None
    abs_val = abs(val)
    if abs_val >= 1e12:
        return f"${val / 1e12:.1f}T"
    if abs_val >= 1e9:
        return f"${val / 1e9:.1f}B"
    if abs_val >= 1e6:
        return f"${val / 1e6:.0f}M"
    return f"${val:,.0f}"


def _safe_float(val):
    """Convert to float, returning None if not numeric."""
    if val is None:
        return None
    try:
        result = float(val)
        if result != result:  # NaN check
            return None
        return result
    except (TypeError, ValueError):
        return None


def fetch_fundamentals():
    """Fetch ARR Multiple and Rule of 40 for all public tickers."""
    DATA_DIR.mkdir(exist_ok=True)
    output_file = DATA_DIR / "fundamentals.json"

    print("Fetching fundamentals (ARR Multiple, Rule of 40)...")
    print(f"Source: Yahoo Finance (yfinance)")
    print(f"Tracking {len(TICKERS)} tickers\n")

    result = {
        "fetched_at": datetime.now().isoformat(),
        "source": "Yahoo Finance (yfinance)",
        "methodology": {
            "arr_multiple": (
                "Enterprise Value / Trailing Twelve Month Revenue. "
                "EV = Market Cap + Total Debt - Cash. "
                "Source: yfinance Ticker.info['enterpriseValue'] and Ticker.info['totalRevenue']."
            ),
            "rule_of_40": (
                "YoY Revenue Growth (%) + EBITDA Margin (%). "
                "A score >= 40 indicates a healthy SaaS company. "
                "Source: yfinance Ticker.info['revenueGrowth'] and Ticker.info['ebitdaMargins']."
            ),
        },
        "tickers": {},
    }

    success = 0
    failed = 0

    for ticker, meta in TICKERS.items():
        try:
            kwargs = {}
            if _yf_session is not None:
                kwargs["session"] = _yf_session
            t = yf.Ticker(ticker, **kwargs)
            info = t.info or {}

            ev = _safe_float(info.get("enterpriseValue"))
            market_cap = _safe_float(info.get("marketCap"))
            current_price = _safe_float(info.get("currentPrice") or info.get("regularMarketPrice"))
            ttm_revenue = _safe_float(info.get("totalRevenue"))
            revenue_growth = _safe_float(info.get("revenueGrowth"))
            ebitda_margins = _safe_float(info.get("ebitdaMargins"))

            arr_multiple = None
            if ev is not None and ttm_revenue is not None and ttm_revenue > 0:
                arr_multiple = round(ev / ttm_revenue, 1)

            revenue_growth_pct = None
            if revenue_growth is not None:
                revenue_growth_pct = round(revenue_growth * 100, 1)

            ebitda_margin_pct = None
            if ebitda_margins is not None:
                ebitda_margin_pct = round(ebitda_margins * 100, 1)

            rule_of_40 = None
            if revenue_growth_pct is not None and ebitda_margin_pct is not None:
                rule_of_40 = round(revenue_growth_pct + ebitda_margin_pct, 1)

            entry = {
                "name": meta["name"],
                "sector": meta["sector"],
                "enterprise_value": ev,
                "market_cap": market_cap,
                "current_price": current_price,
                "ttm_revenue": ttm_revenue,
                "arr_multiple": arr_multiple,
                "revenue_growth_pct": revenue_growth_pct,
                "ebitda_margin_pct": ebitda_margin_pct,
                "rule_of_40": rule_of_40,
                "inputs": {
                    "ev": _fmt_large(ev),
                    "market_cap": _fmt_large(market_cap),
                    "ttm_revenue": _fmt_large(ttm_revenue),
                    "revenue_growth": f"{revenue_growth_pct}%" if revenue_growth_pct is not None else None,
                    "ebitda_margin": f"{ebitda_margin_pct}%" if ebitda_margin_pct is not None else None,
                },
            }

            result["tickers"][ticker] = entry

            arr_str = f"{arr_multiple:.1f}x" if arr_multiple is not None else "N/A"
            r40_str = f"{rule_of_40:.0f}" if rule_of_40 is not None else "N/A"
            ev_str = _fmt_large(ev) or "N/A"
            rev_str = _fmt_large(ttm_revenue) or "N/A"
            print(f"  {ticker:10s} {meta['name']:25s} EV={ev_str:>8s}  Rev={rev_str:>8s}  ARR Mult={arr_str:>6s}  Ro40={r40_str:>4s}")
            success += 1

        except Exception as e:
            print(f"  ⚠ {ticker:10s} {meta['name']:25s} ERROR: {e}")
            failed += 1

        time.sleep(DELAY_BETWEEN_TICKERS)

    with open(output_file, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\n✅ Saved to {output_file}")
    print(f"   {success} tickers fetched, {failed} failed")
    return result


if __name__ == "__main__":
    if "--force" in sys.argv:
        output = DATA_DIR / "fundamentals.json"
        if output.exists():
            output.unlink()
    fetch_fundamentals()
