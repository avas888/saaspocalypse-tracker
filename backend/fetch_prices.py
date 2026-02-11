#!/usr/bin/env python3
"""
SaaSpocalypse Price Fetcher
Fetches daily closing prices for all tracked public companies via FMP API.
Run daily after market close: python fetch_prices.py
Or set up a cron: 0 18 * * 1-5 cd /path/to/backend && python fetch_prices.py
"""

import json
import requests
from datetime import datetime, timedelta
from pathlib import Path

from fmp_fetcher import FMPFetcher
from yf_fallback import get_quote as yf_get_quote, get_historical_eod as yf_get_historical_eod

# All public tickers mapped to sector + company name
TICKERS = {
    # CRM & Sales
    "HUBS":     {"name": "HubSpot",           "sector": "crm"},
    "MNDY":     {"name": "monday.com",         "sector": "crm"},
    "CRM":      {"name": "Salesforce",         "sector": "crm"},
    "FRSH":     {"name": "Freshworks",         "sector": "crm"},
    # Project Management
    "ASAN":     {"name": "Asana",              "sector": "project"},
    "SMAR":     {"name": "Smartsheet",         "sector": "project"},
    # SMB Accounting
    "INTU":     {"name": "Intuit",             "sector": "accounting"},
    "XRO.AX":   {"name": "Xero",              "sector": "accounting"},
    "SGE.L":    {"name": "Sage Group",         "sector": "accounting"},
    "TOTS3.SA": {"name": "TOTVS",             "sector": "accounting"},
    "4478.T":   {"name": "freee",             "sector": "accounting"},
    # SMB Payroll & HR
    "ADP":      {"name": "ADP",               "sector": "payroll"},
    "PAYX":     {"name": "Paychex",           "sector": "payroll"},
    "PAYC":     {"name": "Paycom",            "sector": "payroll"},
    "PCTY":     {"name": "Paylocity",         "sector": "payroll"},
    "XYZ":      {"name": "Block (Square)",    "sector": "payroll"},  # also in POS
    # Restaurant POS
    "TOST":     {"name": "Toast",             "sector": "pos"},
    # XYZ already listed above (Block)
    "LSPD":     {"name": "Lightspeed",        "sector": "pos"},
    "FI":       {"name": "Fiserv (Clover)",   "sector": "pos"},
    "DASH":     {"name": "DoorDash (Otter)",  "sector": "pos"},
    # Hotel PMS
    "AGYS":     {"name": "Agilysys",          "sector": "hotel"},
    "SABR":     {"name": "Sabre",             "sector": "hotel"},
    "SDR.AX":   {"name": "SiteMinder",         "sector": "hotel"},
    # Document & E-Sign
    "DOCU":     {"name": "DocuSign",          "sector": "document"},
    "DBX":      {"name": "Dropbox",           "sector": "document"},
    # E-Commerce
    "SHOP":     {"name": "Shopify",           "sector": "ecommerce"},
    "BIGC":     {"name": "BigCommerce",       "sector": "ecommerce"},
    "WIX":      {"name": "Wix",              "sector": "ecommerce"},
    "SQSP":     {"name": "Squarespace",       "sector": "ecommerce"},
    "VTEX":     {"name": "VTEX",             "sector": "ecommerce"},
}

# Sector metadata for computing averages
SECTORS = {
    "crm":        {"name": "CRM & Sales",           "tickers": ["HUBS", "MNDY", "CRM", "FRSH"]},
    "project":    {"name": "Project Management",     "tickers": ["ASAN", "SMAR", "MNDY"]},
    "accounting": {"name": "SMB Accounting",          "tickers": ["INTU", "XRO.AX", "SGE.L", "TOTS3.SA", "4478.T"]},
    "payroll":    {"name": "SMB Payroll & HR",        "tickers": ["ADP", "PAYX", "PAYC", "PCTY", "XYZ"]},
    "pos":        {"name": "Restaurant POS",          "tickers": ["TOST", "XYZ", "LSPD", "FI", "DASH"]},
    "hotel":      {"name": "Hotel PMS",               "tickers": ["AGYS", "SABR", "SDR.AX"]},
    "document":   {"name": "Document & E-Sign",       "tickers": ["DOCU", "DBX"]},
    "ecommerce":  {"name": "E-Commerce & Retail SaaS", "tickers": ["SHOP", "BIGC", "WIX", "SQSP", "VTEX"]},
}

DATA_DIR = Path(__file__).parent.parent / "data"


def fetch_daily_snapshot(date_str=None):
    """Fetch closing prices for all tickers via FMP batch-quote. Saves to data/{date}.json"""
    DATA_DIR.mkdir(exist_ok=True)

    if date_str is None:
        date_str = datetime.now().strftime("%Y-%m-%d")

    output_file = DATA_DIR / f"{date_str}.json"

    if output_file.exists():
        print(f"Data already exists for {date_str}. Use --force to overwrite.")
        return

    print(f"Fetching prices for {date_str}...")
    print(f"Tracking {len(TICKERS)} tickers across {len(SECTORS)} sectors\n")

    all_tickers = list(TICKERS.keys())
    fetcher = FMPFetcher()

    quotes = []
    for ticker in all_tickers:
        q = None
        used_fallback = False
        try:
            q = fetcher.get_quote(ticker)
        except (requests.exceptions.HTTPError, Exception):
            pass
        if not q:
            q = yf_get_quote(ticker)
            used_fallback = q is not None

        if q:
            quotes.append(q)
            if used_fallback:
                print(f"  📡 {ticker}: yf fallback (FMP unavailable)")
        else:
            print(f"  ⚠ {ticker}: no data (FMP + yfinance)")

    quote_by_symbol = {q.get("symbol"): q for q in quotes if q.get("symbol")}

    snapshot = {
        "date": date_str,
        "fetched_at": datetime.now().isoformat(),
        "tickers": {},
        "sectors": {},
    }

    for ticker in all_tickers:
        q = quote_by_symbol.get(ticker)
        if not q:
            continue

        try:
            price = q.get("price") or q.get("close")
            change = q.get("change", 0) or 0
            changes_pct = q.get("changePercentage") or q.get("changesPercentage") or q.get("changePercent") or 0

            if price is None:
                print(f"  ⚠ {ticker}: missing price")
                continue

            current = float(price)
            prev_close = q.get("previousClose")
            if prev_close is not None:
                prev_close = float(prev_close)
            else:
                prev_close = current - float(change) if change else current

            daily_change = ((current - prev_close) / prev_close) * 100 if prev_close else float(changes_pct or 0)

            snapshot["tickers"][ticker] = {
                "name": TICKERS[ticker]["name"],
                "sector": TICKERS[ticker]["sector"],
                "close": round(current, 2),
                "prev_close": round(prev_close, 2),
                "daily_pct": round(daily_change, 2),
            }
            direction = "🟢" if daily_change >= 0 else "🔴"
            print(f"  {direction} {ticker:10s} {TICKERS[ticker]['name']:25s} ${current:>10.2f}  {daily_change:>+.2f}%")

        except (TypeError, ValueError) as e:
            print(f"  ❌ {ticker}: {e}")

    # Compute sector averages
    for sector_id, sector_info in SECTORS.items():
        sector_changes = [snapshot["tickers"][t]["daily_pct"] for t in sector_info["tickers"] if t in snapshot["tickers"]]
        if sector_changes:
            avg = sum(sector_changes) / len(sector_changes)
            snapshot["sectors"][sector_id] = {
                "name": sector_info["name"],
                "avg_daily_pct": round(avg, 2),
                "tickers_tracked": len(sector_changes),
                "tickers_total": len(sector_info["tickers"]),
            }

    with open(output_file, "w") as f:
        json.dump(snapshot, f, indent=2)

    print(f"\n✅ Saved to {output_file}")
    print(f"   {len(snapshot['tickers'])} tickers, {len(snapshot['sectors'])} sectors")
    return snapshot


def fetch_baseline(start_date="2026-02-03"):
    """Fetch baseline prices as of the SaaSpocalypse start date via FMP historical EOD."""
    baseline_file = DATA_DIR / "baseline.json"

    if baseline_file.exists():
        print(f"Baseline already exists. Use --force-baseline to overwrite.")
        return

    print(f"Fetching baseline prices for {start_date}...")

    all_tickers = list(TICKERS.keys())
    fetcher = FMPFetcher()
    end_date = (datetime.strptime(start_date, "%Y-%m-%d") + timedelta(days=5)).strftime("%Y-%m-%d")

    baseline = {
        "date": start_date,
        "fetched_at": datetime.now().isoformat(),
        "description": "SaaSpocalypse baseline — prices as of market close Feb 3, 2026",
        "tickers": {},
    }

    for ticker in all_tickers:
        rows = None
        used_fallback = False
        try:
            rows = fetcher.get_historical_eod(ticker, start_date, end_date)
        except (requests.exceptions.HTTPError, Exception):
            pass
        if not rows:
            rows = yf_get_historical_eod(ticker, start_date, end_date)
            used_fallback = bool(rows)
        if not rows:
            print(f"  ⚠ {ticker}: no historical data (FMP + yfinance)")
            continue

        # Rows newest first; find row for start_date (or closest)
        target_row = None
        for r in rows:
            d = r.get("date", "")[:10]
            if d <= start_date:
                target_row = r
                break
        if not target_row:
            target_row = rows[-1]

        baseline_price_val = target_row.get("close") or target_row.get("open")
        if baseline_price_val is None:
            continue

        baseline_price = float(baseline_price_val)
        baseline["tickers"][ticker] = {
            "name": TICKERS[ticker]["name"],
            "sector": TICKERS[ticker]["sector"],
            "price": round(baseline_price, 2),
        }
        msg = f"  {ticker:10s} {TICKERS[ticker]['name']:25s} ${baseline_price:>10.2f}"
        if used_fallback:
            msg += "  (yf fallback)"
        print(msg)

    with open(baseline_file, "w") as f:
        json.dump(baseline, f, indent=2)

    print(f"\n✅ Baseline saved to {baseline_file}")


def backfill(start_date="2026-02-03"):
    """Backfill daily snapshots from start_date to today using FMP historical EOD."""
    print(f"Backfilling from {start_date} to today...\n")

    DATA_DIR.mkdir(exist_ok=True)
    all_tickers = list(TICKERS.keys())
    end_date = datetime.now().strftime("%Y-%m-%d")
    fetcher = FMPFetcher()

    # Fetch from 5 days before start to get prev_close for first day
    fetch_start = (datetime.strptime(start_date, "%Y-%m-%d") - timedelta(days=5)).strftime("%Y-%m-%d")

    # Per-ticker: date -> {close, prev_close}
    by_ticker = {}

    for ticker in all_tickers:
        rows = None
        try:
            rows = fetcher.get_historical_eod(ticker, fetch_start, end_date)
        except (requests.exceptions.HTTPError, Exception):
            pass
        if not rows:
            rows = yf_get_historical_eod(ticker, fetch_start, end_date)
        if not rows:
            continue

        # Rows newest first; sort by date ascending for prev_close logic
        sorted_rows = sorted(rows, key=lambda r: r.get("date", ""))

        by_ticker[ticker] = {}
        for i, r in enumerate(sorted_rows):
            d = r.get("date", "")[:10]
            close_val = r.get("close")
            if close_val is None:
                continue
            close_val = float(close_val)
            prev_close = None
            if i > 0:
                prev_close = float(sorted_rows[i - 1].get("close", 0))
            by_ticker[ticker][d] = {"close": close_val, "prev_close": prev_close}

    # Collect all trading dates
    all_dates = set()
    for ticker, dates in by_ticker.items():
        all_dates.update(dates.keys())
    all_dates = sorted(all_dates)

    for i, date_str in enumerate(all_dates):
        if i == 0:
            continue  # need previous day for daily_pct
        if date_str < start_date:
            continue  # only output from start_date onwards

        output_file = DATA_DIR / f"{date_str}.json"
        if output_file.exists():
            print(f"  ⏭ {date_str} already exists")
            continue

        prev_date = all_dates[i - 1]
        snapshot = {
            "date": date_str,
            "fetched_at": datetime.now().isoformat(),
            "tickers": {},
            "sectors": {},
        }

        for ticker in all_tickers:
            ticker_dates = by_ticker.get(ticker, {})
            if date_str not in ticker_dates or prev_date not in ticker_dates:
                continue

            curr = ticker_dates[date_str]
            prev = ticker_dates[prev_date]
            prev_close = curr.get("prev_close") or prev["close"]
            current = curr["close"]
            daily_change = ((current - prev_close) / prev_close) * 100 if prev_close else 0

            snapshot["tickers"][ticker] = {
                "name": TICKERS[ticker]["name"],
                "sector": TICKERS[ticker]["sector"],
                "close": round(current, 2),
                "prev_close": round(prev_close, 2),
                "daily_pct": round(daily_change, 2),
            }

        for sector_id, sector_info in SECTORS.items():
            changes = [snapshot["tickers"][t]["daily_pct"] for t in sector_info["tickers"] if t in snapshot["tickers"]]
            if changes:
                snapshot["sectors"][sector_id] = {
                    "name": sector_info["name"],
                    "avg_daily_pct": round(sum(changes) / len(changes), 2),
                    "tickers_tracked": len(changes),
                    "tickers_total": len(sector_info["tickers"]),
                }

        with open(output_file, "w") as f:
            json.dump(snapshot, f, indent=2)

        print(f"  ✅ {date_str}: {len(snapshot['tickers'])} tickers")

    print(f"\nBackfill complete.")


def fetch_ltm_high(zero_date="2026-02-03"):
    """
    Fetch LTM (Last Twelve Months) high for each ticker via FMP historical EOD.
    Zero marker = Feb 3 (pre-SaaSpocalypse). LTM high % = (peak_price - zero_price) / zero_price * 100.
    Saves to data/ltm_high.json.
    """
    DATA_DIR.mkdir(exist_ok=True)
    output_file = DATA_DIR / "ltm_high.json"

    zero_dt = datetime.strptime(zero_date, "%Y-%m-%d")
    start_date = (zero_dt - timedelta(days=365)).strftime("%Y-%m-%d")
    end_date = (zero_dt + timedelta(days=5)).strftime("%Y-%m-%d")

    print(f"Fetching LTM high (zero = {zero_date})...")
    print(f"Period: {start_date} to {zero_date}\n")

    all_tickers = list(TICKERS.keys())
    fetcher = FMPFetcher()

    result = {
        "fetched_at": datetime.now().isoformat(),
        "zero_date": zero_date,
        "description": f"LTM high % from {zero_date} baseline. Run `npm run fetch:ltm` to refresh.",
        "tickers": {},
        "sectors": {},
    }

    for ticker in all_tickers:
        rows = None
        used_fallback = False
        try:
            rows = fetcher.get_historical_eod(ticker, start_date, end_date)
        except (requests.exceptions.HTTPError, Exception):
            pass
        if not rows:
            rows = yf_get_historical_eod(ticker, start_date, end_date)
            used_fallback = bool(rows)
        if not rows:
            print(f"  ⚠ {ticker}: no historical data (FMP + yfinance)")
            continue

        closes = [(r.get("date", "")[:10], float(r["close"])) for r in rows if r.get("close") is not None]
        if not closes:
            continue

        high_price = max(c for _, c in closes)
        high_date = next(d for d, c in closes if c == high_price)
        on_or_before = [(d, c) for d, c in closes if d <= zero_date]
        on_or_before_sorted = sorted(on_or_before, key=lambda x: x[0], reverse=True)
        zero_price = on_or_before_sorted[0][1] if on_or_before_sorted else closes[0][1]

        ltm_pct = ((high_price - zero_price) / zero_price) * 100 if zero_price else 0

        result["tickers"][ticker] = {
            "name": TICKERS[ticker]["name"],
            "sector": TICKERS[ticker]["sector"],
            "high_price": round(high_price, 2),
            "high_date": high_date,
            "zero_price": round(zero_price, 2),
            "ltm_high_pct": round(ltm_pct, 2),
        }
        msg = f"  {ticker:10s} {TICKERS[ticker]['name']:25s} high {high_date} ${high_price:>8.2f}  LTM +{ltm_pct:.1f}%"
        if used_fallback:
            msg += "  (yf fallback)"
        print(msg)

    for sector_id, sector_info in SECTORS.items():
        ticker_data = [(t, result["tickers"][t]) for t in sector_info["tickers"] if t in result["tickers"]]
        if ticker_data:
            pcts = [d["ltm_high_pct"] for _, d in ticker_data]
            peak_ticker = max(ticker_data, key=lambda x: x[1]["ltm_high_pct"])
            high_date = peak_ticker[1]["high_date"]
            result["sectors"][sector_id] = {
                "name": sector_info["name"],
                "ltm_high_pct": round(sum(pcts) / len(pcts), 2),
                "high_date": high_date,
                "tickers_tracked": len(pcts),
                "tickers_total": len(sector_info["tickers"]),
            }

    with open(output_file, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\n✅ Saved to {output_file}")
    return result


if __name__ == "__main__":
    import sys

    if "--ltm" in sys.argv or "--ltm-high" in sys.argv:
        fetch_ltm_high()
    elif "--baseline" in sys.argv or "--force-baseline" in sys.argv:
        if "--force-baseline" in sys.argv:
            baseline_file = DATA_DIR / "baseline.json"
            if baseline_file.exists():
                baseline_file.unlink()
        fetch_baseline()
    elif "--backfill" in sys.argv:
        fetch_baseline()
        backfill()
    elif "--force" in sys.argv:
        today = datetime.now().strftime("%Y-%m-%d")
        f = DATA_DIR / f"{today}.json"
        if f.exists():
            f.unlink()
        fetch_daily_snapshot()
    else:
        fetch_daily_snapshot()
