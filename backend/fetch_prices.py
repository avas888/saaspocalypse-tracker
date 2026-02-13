#!/usr/bin/env python3
"""
SaaSpocalypse Price Fetcher
Fetches daily closing prices for all tracked public companies via FMP API
with Yahoo Finance as backup (and primary for international tickers).
Run daily after market close: python fetch_prices.py
Or set up a cron: 0 18 * * 1-5 cd /path/to/backend && python fetch_prices.py
"""

import json
import sys
import time
import requests
from datetime import datetime, timedelta
from pathlib import Path

from fmp_fetcher import FMPFetcher
from yf_fallback import get_quote as yf_get_quote, get_historical_eod as yf_get_historical_eod

# Tickers on international exchanges: Yahoo often has better coverage than FMP
YAHOO_FIRST_TICKERS = frozenset({"XRO.AX", "SGE.L", "TOTS3.SA", "4478.T", "SDR.AX", "CSU.TO"})
YAHOO_EXCLUDED = frozenset({"SMAR"})  # FMP only — Yahoo has no/incorrect data
MAX_RETRIES = 2
RETRY_DELAY_SEC = 2


def _get_fetcher():
    """Return FMP fetcher if API key is set, else None (use yfinance only)."""
    try:
        return FMPFetcher()
    except ValueError:
        return None


def _is_valid_quote(q) -> bool:
    """Check if quote has usable price data."""
    if not q or not isinstance(q, dict):
        return False
    price = q.get("price") or q.get("close")
    return price is not None and float(price) > 0


def _fetch_quote_with_fallback(ticker: str, fetcher) -> tuple[dict | None, bool]:
    """Fetch quote: Yahoo-first for international tickers, else FMP then Yahoo. Returns (quote, used_yahoo)."""
    use_yahoo_first = ticker in YAHOO_FIRST_TICKERS
    yahoo_excluded = ticker in YAHOO_EXCLUDED
    for attempt in range(MAX_RETRIES + 1):
        q = None
        if use_yahoo_first:
            q = yf_get_quote(ticker)
            if _is_valid_quote(q):
                return (q, True)
            if fetcher:
                try:
                    q = fetcher.get_quote(ticker)
                except (requests.exceptions.HTTPError, Exception):
                    pass
            if _is_valid_quote(q):
                return (q, False)
        else:
            if fetcher:
                try:
                    q = fetcher.get_quote(ticker)
                except (requests.exceptions.HTTPError, Exception):
                    pass
            if _is_valid_quote(q):
                return (q, False)
            if not yahoo_excluded:
                q = yf_get_quote(ticker)
                if _is_valid_quote(q):
                    return (q, True)
        if attempt < MAX_RETRIES:
            time.sleep(RETRY_DELAY_SEC)
    return (None, False)


def _fetch_historical_with_fallback(ticker: str, from_date: str, to_date: str, fetcher) -> tuple[list | None, bool]:
    """Fetch historical EOD: Yahoo-first for international tickers, else FMP then Yahoo. Returns (rows, used_yahoo)."""
    use_yahoo_first = ticker in YAHOO_FIRST_TICKERS
    yahoo_excluded = ticker in YAHOO_EXCLUDED
    for attempt in range(MAX_RETRIES + 1):
        rows = None
        if use_yahoo_first:
            rows = yf_get_historical_eod(ticker, from_date, to_date)
            if _is_valid_historical(rows):
                return (rows, True)
            if fetcher:
                try:
                    rows = fetcher.get_historical_eod(ticker, from_date, to_date)
                except (requests.exceptions.HTTPError, Exception):
                    pass
            if _is_valid_historical(rows):
                return (rows, False)
        else:
            if fetcher:
                try:
                    rows = fetcher.get_historical_eod(ticker, from_date, to_date)
                except (requests.exceptions.HTTPError, Exception):
                    pass
            if _is_valid_historical(rows):
                return (rows, False)
            if not yahoo_excluded:
                rows = yf_get_historical_eod(ticker, from_date, to_date)
                if _is_valid_historical(rows):
                    return (rows, True)
        if attempt < MAX_RETRIES:
            time.sleep(RETRY_DELAY_SEC)
    return (None, False)


def _is_valid_historical(rows) -> bool:
    """Check if historical rows have usable close data."""
    if not rows or not isinstance(rows, list):
        return False
    return any(r.get("close") is not None for r in rows)

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
    # SaaS Software Consolidators
    "CSU.TO":   {"name": "Constellation Software", "sector": "consolidators"},
    "ASUR":     {"name": "Asure Software",        "sector": "consolidators"},
    "UPLD":     {"name": "Upland Software",       "sector": "consolidators"},
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
    "consolidators": {"name": "SaaS Software Consolidators", "tickers": ["CSU.TO", "ASUR", "UPLD"]},
}

DATA_DIR = Path(__file__).parent.parent / "data"


def _patch_baseline_from_daily():
    """Fill missing baseline tickers from earliest daily snapshot (fallback when historical fails)."""
    baseline_file = DATA_DIR / "baseline.json"
    if not baseline_file.exists():
        return
    daily_files = sorted(DATA_DIR.glob("2026-*.json"))
    if not daily_files:
        return
    with open(baseline_file) as f:
        baseline = json.load(f)
    tickers_data = baseline.get("tickers", {})
    all_tickers = set(TICKERS.keys())
    missing = all_tickers - set(tickers_data.keys())
    if not missing:
        return
    # Use earliest snapshot that has each ticker (e.g. fetch:force may have it in latest)
    patched = 0
    for daily_path in daily_files:
        daily = json.loads(daily_path.read_text())
        tickers = daily.get("tickers", {})
        for t in list(missing):
            if t in tickers and tickers[t].get("close"):
                close = float(tickers[t]["close"])
                baseline["tickers"][t] = {
                    "name": TICKERS[t]["name"],
                    "sector": TICKERS[t]["sector"],
                    "price": round(close, 2),
                }
                patched += 1
                print(f"  📋 Patched baseline for {t} from {daily_path.name} (${close:.2f})")
                missing.discard(t)
        if not missing:
            break
    if patched:
        with open(baseline_file, "w") as f:
            json.dump(baseline, f, indent=2)
        print(f"  ✅ Patched {patched} missing baseline tickers from daily snapshots")


def _patch_ltm_from_daily():
    """Fill missing LTM tickers using max close from daily snapshots (fallback when historical fails)."""
    ltm_file = DATA_DIR / "ltm_high.json"
    baseline_file = DATA_DIR / "baseline.json"
    if not ltm_file.exists() or not baseline_file.exists():
        return
    with open(ltm_file) as f:
        ltm = json.load(f)
    with open(baseline_file) as f:
        baseline = json.load(f)
    base_prices = baseline.get("tickers", {})
    ltm_tickers = ltm.get("tickers", {})
    all_tickers = set(TICKERS.keys())
    missing = all_tickers - set(ltm_tickers.keys())
    if not missing:
        return
    daily_files = sorted(DATA_DIR.glob("2026-*.json"))
    if not daily_files:
        return
    # For each missing ticker, find max close across all dailies and use baseline as zero
    patched = 0
    for t in missing:
        base_price = base_prices.get(t, {}).get("price")
        if base_price is None or base_price <= 0:
            continue
        closes = []
        for daily_path in daily_files:
            daily = json.loads(daily_path.read_text())
            tick_data = daily.get("tickers", {}).get(t)
            if tick_data and tick_data.get("close"):
                closes.append((daily_path.name, float(tick_data["close"])))
        if not closes:
            continue
        high_close = max(c for _, c in closes)
        high_date_str = next(d for d, c in closes if c == high_close)
        high_date = high_date_str.replace(".json", "")[:10] if isinstance(high_date_str, str) else str(high_date_str)[:10]
        ltm_pct = ((high_close - base_price) / base_price) * 100
        ltm["tickers"][t] = {
            "name": TICKERS[t]["name"],
            "sector": TICKERS[t]["sector"],
            "high_price": round(high_close, 2),
            "high_date": high_date,
            "zero_price": round(base_price, 2),
            "ltm_high_pct": round(ltm_pct, 2),
        }
        patched += 1
        print(f"  📋 Patched LTM for {t} from daily snapshots (high ${high_close:.2f}, +{ltm_pct:.1f}%)")
    if patched:
        # Recompute sector LTM averages
        for sector_id, sector_info in SECTORS.items():
            ticker_data = [(t, ltm["tickers"][t]) for t in sector_info["tickers"] if t in ltm["tickers"]]
            if ticker_data:
                pcts = [d["ltm_high_pct"] for _, d in ticker_data]
                peak_ticker = max(ticker_data, key=lambda x: x[1]["ltm_high_pct"])
                high_date = peak_ticker[1]["high_date"]
                ltm["sectors"][sector_id] = {
                    "name": sector_info["name"],
                    "ltm_high_pct": round(sum(pcts) / len(pcts), 2),
                    "high_date": high_date,
                    "tickers_tracked": len(pcts),
                    "tickers_total": len(sector_info["tickers"]),
                }
        with open(ltm_file, "w") as f:
            json.dump(ltm, f, indent=2)
        print(f"  ✅ Patched {patched} missing LTM tickers from daily snapshots")


def _fetch_historical_ticker_for_date(ticker: str, date_str: str, fetcher) -> dict | None:
    """
    Get ticker data from historical EOD for a specific date.
    Used when live quote fails (e.g. international markets closed during US trading hours).
    Returns ticker dict with name, sector, close, prev_close, daily_pct or None.
    """
    fetch_start = (datetime.strptime(date_str, "%Y-%m-%d") - timedelta(days=5)).strftime("%Y-%m-%d")
    fetch_end = (datetime.strptime(date_str, "%Y-%m-%d") + timedelta(days=2)).strftime("%Y-%m-%d")
    rows, _ = _fetch_historical_with_fallback(ticker, fetch_start, fetch_end, fetcher)
    if not rows:
        return None
    sorted_rows = sorted(rows, key=lambda r: r.get("date", ""))
    by_date = {r.get("date", "")[:10]: r for r in sorted_rows if r.get("close") is not None}
    if date_str not in by_date:
        return None
    curr = by_date[date_str]
    idx = next((i for i, r in enumerate(sorted_rows) if r.get("date", "")[:10] == date_str), -1)
    prev_close = float(sorted_rows[idx - 1].get("close", curr["close"])) if idx > 0 else float(curr.get("close", 0))
    current = float(curr["close"])
    daily_change = ((current - prev_close) / prev_close) * 100 if prev_close else 0
    return {
        "name": TICKERS[ticker]["name"],
        "sector": TICKERS[ticker]["sector"],
        "close": round(current, 2),
        "prev_close": round(prev_close, 2),
        "daily_pct": round(daily_change, 2),
    }


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
    fetcher = _get_fetcher()

    quotes = []
    for ticker in all_tickers:
        q, used_fallback = _fetch_quote_with_fallback(ticker, fetcher)

        if q:
            quotes.append(q)
            if used_fallback:
                print(f"  📡 {ticker}: yf fallback (FMP unavailable)")
        else:
            # Fallback to historical EOD when live quote fails (international markets closed, etc.)
            ticker_data = _fetch_historical_ticker_for_date(ticker, date_str, fetcher)
            if ticker_data:
                # Build a quote-like dict for downstream processing
                quotes.append({
                    "symbol": ticker,
                    "price": ticker_data["close"],
                    "previousClose": ticker_data["prev_close"],
                    "change": ticker_data["close"] - ticker_data["prev_close"],
                    "changePercentage": ticker_data["daily_pct"],
                })
                print(f"  📋 {ticker}: historical EOD (live quote unavailable)")
            else:
                print(f"  ⚠ {ticker}: no data (FMP + yfinance + historical)")

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

    # Patch any remaining missing tickers from historical EOD (belt-and-suspenders)
    _patch_missing_tickers_in_daily(output_file, date_str, snapshot)

    print(f"\n✅ Saved to {output_file}")
    print(f"   {len(snapshot['tickers'])} tickers, {len(snapshot['sectors'])} sectors")
    return snapshot


def _patch_missing_tickers_in_daily(file_path: Path, date_str: str, snapshot: dict) -> None:
    """Fill missing tickers in a daily snapshot from historical EOD. Updates file if any patched."""
    all_tickers = set(TICKERS.keys())
    present = set(snapshot.get("tickers", {}).keys())
    missing = all_tickers - present
    if not missing:
        return
    fetcher = _get_fetcher()
    patched = 0
    for ticker in missing:
        data = _fetch_historical_ticker_for_date(ticker, date_str, fetcher)
        if data:
            snapshot["tickers"][ticker] = data
            patched += 1
            print(f"  📋 Patched {ticker} from historical into {file_path.name}")
    if patched:
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
        with open(file_path, "w") as f:
            json.dump(snapshot, f, indent=2)


def fetch_intraday_snapshot(date_str=None, time_label="noon", suffix="noon"):
    """Fetch current (intraday) prices and save as {date}-{suffix}.json. Creates a separate column for intraday data."""
    DATA_DIR.mkdir(exist_ok=True)

    if date_str is None:
        date_str = datetime.now().strftime("%Y-%m-%d")

    output_file = DATA_DIR / f"{date_str}-{suffix}.json"

    if output_file.exists():
        print(f"{time_label} data already exists for {date_str}. Use --force to overwrite.")
        return

    print(f"Fetching {time_label} prices for {date_str}...")
    print(f"Tracking {len(TICKERS)} tickers across {len(SECTORS)} sectors\n")

    all_tickers = list(TICKERS.keys())
    fetcher = _get_fetcher()

    quotes = []
    for ticker in all_tickers:
        q, used_fallback = _fetch_quote_with_fallback(ticker, fetcher)

        if q:
            quotes.append(q)
            if used_fallback:
                print(f"  📡 {ticker}: yf fallback (FMP unavailable)")
        else:
            print(f"  ⚠ {ticker}: no data (FMP + yfinance)")

    quote_by_symbol = {q.get("symbol"): q for q in quotes if q.get("symbol")}

    snapshot = {
        "date": date_str,
        "time_label": time_label,
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


def fetch_noon_snapshot(date_str=None):
    """Fetch current (intraday) prices and save as {date}-noon.json."""
    return fetch_intraday_snapshot(date_str, time_label="noon", suffix="noon")


def fetch_11am_snapshot(date_str=None):
    """Fetch current (intraday) prices and save as {date}-11am.json."""
    return fetch_intraday_snapshot(date_str, time_label="11am", suffix="11am")


def fetch_baseline(start_date="2026-02-03"):
    """Fetch baseline prices as of the SaaSpocalypse start date via FMP historical EOD."""
    baseline_file = DATA_DIR / "baseline.json"

    if baseline_file.exists():
        print(f"Baseline already exists. Use --force-baseline to overwrite.")
        return

    print(f"Fetching baseline prices for {start_date}...")

    all_tickers = list(TICKERS.keys())
    fetcher = _get_fetcher()
    end_date = (datetime.strptime(start_date, "%Y-%m-%d") + timedelta(days=5)).strftime("%Y-%m-%d")

    baseline = {
        "date": start_date,
        "fetched_at": datetime.now().isoformat(),
        "description": "SaaSpocalypse baseline — prices as of market close Feb 3, 2026",
        "tickers": {},
    }

    for ticker in all_tickers:
        rows, used_fallback = _fetch_historical_with_fallback(ticker, start_date, end_date, fetcher)
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
    fetcher = _get_fetcher()

    # Fetch from 5 days before start to get prev_close for first day
    fetch_start = (datetime.strptime(start_date, "%Y-%m-%d") - timedelta(days=5)).strftime("%Y-%m-%d")

    # Per-ticker: date -> {close, prev_close}
    by_ticker = {}

    for ticker in all_tickers:
        rows, _ = _fetch_historical_with_fallback(ticker, fetch_start, end_date, fetcher)
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

    _patch_daily_missing_tickers()
    print(f"\nBackfill complete.")


def repair_daily_files():
    """Patch missing tickers in existing daily files (e.g. after fetch during US hours missed international)."""
    daily_files = sorted(p for p in DATA_DIR.glob("2026-*.json") if p.stem.count("-") <= 2)
    if not daily_files:
        print("No daily files to repair.")
        return
    print(f"Repairing {len(daily_files)} daily file(s)...\n")
    for daily_path in daily_files:
        date_str = daily_path.stem
        if date_str.count("-") > 2:
            continue
        daily = json.loads(daily_path.read_text())
        snapshot = daily
        _patch_missing_tickers_in_daily(daily_path, date_str, snapshot)
    print("\n✅ Repair complete.")


def _patch_daily_missing_tickers():
    """Merge missing tickers into existing daily files (e.g. SMAR added after initial backfill)."""
    daily_files = sorted(DATA_DIR.glob("2026-*.json"))
    if not daily_files:
        return
    all_tickers = set(TICKERS.keys())
    fetcher = _get_fetcher()
    fetch_start = (datetime.strptime("2026-02-01", "%Y-%m-%d") - timedelta(days=5)).strftime("%Y-%m-%d")
    end_date = datetime.now().strftime("%Y-%m-%d")
    patched_count = 0
    for ticker in all_tickers:
        rows, _ = _fetch_historical_with_fallback(ticker, fetch_start, end_date, fetcher)
        if not rows:
            continue
        sorted_rows = sorted(rows, key=lambda r: r.get("date", ""))
        by_date = {r.get("date", "")[:10]: r for r in sorted_rows if r.get("close") is not None}
        for daily_path in daily_files:
            date_str = daily_path.name.replace(".json", "")
            if date_str not in by_date:
                continue
            daily = json.loads(daily_path.read_text())
            tickers_data = daily.get("tickers", {})
            if ticker in tickers_data:
                continue
            curr = by_date[date_str]
            idx = next((i for i, r in enumerate(sorted_rows) if r.get("date", "")[:10] == date_str), -1)
            prev_close = float(sorted_rows[idx - 1].get("close", 0)) if idx > 0 else float(curr.get("close", 0))
            current = float(curr.get("close", 0))
            daily_change = ((current - prev_close) / prev_close) * 100 if prev_close else 0
            tickers_data[ticker] = {
                "name": TICKERS[ticker]["name"],
                "sector": TICKERS[ticker]["sector"],
                "close": round(current, 2),
                "prev_close": round(prev_close, 2),
                "daily_pct": round(daily_change, 2),
            }
            for sector_id, sector_info in SECTORS.items():
                changes = [tickers_data[t]["daily_pct"] for t in sector_info["tickers"] if t in tickers_data]
                if changes:
                    daily["sectors"][sector_id] = {
                        "name": sector_info["name"],
                        "avg_daily_pct": round(sum(changes) / len(changes), 2),
                        "tickers_tracked": len(changes),
                        "tickers_total": len(sector_info["tickers"]),
                    }
            with open(daily_path, "w") as f:
                json.dump(daily, f, indent=2)
            patched_count += 1
            print(f"  📋 Patched {ticker} into {daily_path.name}")
    if patched_count:
        print(f"  ✅ Patched {patched_count} missing ticker entries into daily files")


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
    fetcher = _get_fetcher()

    result = {
        "fetched_at": datetime.now().isoformat(),
        "zero_date": zero_date,
        "description": f"LTM high % from {zero_date} baseline. Run `npm run fetch:ltm` to refresh.",
        "tickers": {},
        "sectors": {},
    }

    for ticker in all_tickers:
        rows, used_fallback = _fetch_historical_with_fallback(ticker, start_date, end_date, fetcher)
        if not rows:
            print(f"  ⚠ {ticker}: no historical data (FMP + yfinance)")
            continue

        closes = [(r.get("date", "")[:10], float(r["close"])) for r in rows if r.get("close") is not None]
        if not closes:
            continue

        # LTM high = peak in period on or before zero_date (pre-SaaSpocalypse only)
        on_or_before = [(d, c) for d, c in closes if d <= zero_date]
        on_or_before_sorted = sorted(on_or_before, key=lambda x: x[0], reverse=True)
        zero_price = on_or_before_sorted[0][1] if on_or_before_sorted else closes[0][1]
        if not on_or_before:
            continue
        high_price = max(c for _, c in on_or_before)
        high_date = next(d for d, c in on_or_before if c == high_price)

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


def validate_data() -> bool:
    """
    Validate that baseline, ltm_high, and at least one daily snapshot have ALL tickers.
    Returns True if valid, False otherwise. Prints missing tickers and exits with 1 on failure.
    """
    all_tickers = set(TICKERS.keys())
    errors = []

    baseline_file = DATA_DIR / "baseline.json"
    if not baseline_file.exists():
        errors.append("baseline.json missing")
    else:
        with open(baseline_file) as f:
            bl = json.load(f)
        missing = all_tickers - set(bl.get("tickers", {}).keys())
        if missing:
            errors.append(f"baseline.json missing tickers: {sorted(missing)}")

    ltm_file = DATA_DIR / "ltm_high.json"
    if not ltm_file.exists():
        errors.append("ltm_high.json missing")
    else:
        with open(ltm_file) as f:
            ltm = json.load(f)
        missing = all_tickers - set(ltm.get("tickers", {}).keys())
        if missing:
            errors.append(f"ltm_high.json missing tickers: {sorted(missing)}")

    daily_files = sorted(DATA_DIR.glob("2026-*.json"))
    if not daily_files:
        errors.append("no daily snapshots (2026-*.json)")
    else:
        latest = json.loads(daily_files[-1].read_text())
        missing = all_tickers - set(latest.get("tickers", {}).keys())
        if missing:
            errors.append(f"latest daily ({daily_files[-1].name}) missing tickers: {sorted(missing)}")

    if errors:
        print("❌ DATA VALIDATION FAILED:")
        for e in errors:
            print(f"  - {e}")
        return False
    print(f"✅ All {len(all_tickers)} tickers present in baseline, ltm_high, and daily snapshots")
    return True


if __name__ == "__main__":
    if "--validate" in sys.argv:
        ok = validate_data()
        sys.exit(0 if ok else 1)
    if "--repair" in sys.argv:
        repair_daily_files()
        sys.exit(0)
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
        _patch_baseline_from_daily()
        _patch_ltm_from_daily()
    elif "--11am" in sys.argv:
        today = datetime.now().strftime("%Y-%m-%d")
        am_file = DATA_DIR / f"{today}-11am.json"
        if am_file.exists() and "--force" in sys.argv:
            am_file.unlink()
        fetch_11am_snapshot()
    elif "--noon" in sys.argv:
        today = datetime.now().strftime("%Y-%m-%d")
        noon_file = DATA_DIR / f"{today}-noon.json"
        if noon_file.exists() and "--force" in sys.argv:
            noon_file.unlink()
        fetch_noon_snapshot()
    else:
        fetch_daily_snapshot()
