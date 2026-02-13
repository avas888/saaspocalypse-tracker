#!/usr/bin/env python3
"""
SaaSpocalypse Sector News Fetcher

Searches the web (DuckDuckGo) for analyst and market news on each SMB SaaS sector.
No API key required — uses duckduckgo-search (web scraping). Run proactively:
  npm run fetch:sector-news

Filters: Only value/valuation/stock news; no articles older than 30 days.
Output: data/sector_news.json — feeds the "Relevant Sector News" tab.
"""

import json
import re
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

try:
    from duckduckgo_search import DDGS
except ImportError:
    try:
        from ddgs import DDGS
    except ImportError:
        print("❌ duckduckgo-search not installed. Run: pip install duckduckgo-search")
        sys.exit(1)

# Sectors from sectors.js — id, name, search terms
SECTORS = [
    {"id": "crm", "name": "CRM & Sales", "icon": "📊", "queries": ["CRM SaaS sector analyst outlook", "Salesforce HubSpot market news AI disruption"]},
    {"id": "project", "name": "Project Management", "icon": "📋", "queries": ["project management software sector analyst", "Asana monday.com SaaS market outlook", "Asana Smartsheet stock analyst", "work management software market"]},
    {"id": "accounting", "name": "SMB Accounting", "icon": "🧾", "queries": ["SMB accounting software sector", "QuickBooks Intuit Xero market analyst"]},
    {"id": "payroll", "name": "SMB Payroll & HR", "icon": "💰", "queries": ["payroll HR software sector analyst", "Gusto Rippling ADP market outlook", "ADP Paycom stock analyst valuation", "payroll software stock earnings"]},
    {"id": "pos", "name": "Restaurant POS", "icon": "🍽️", "queries": ["Toast TOST stock analyst", "Block Square stock valuation", "Lightspeed LSPD stock earnings", "restaurant POS software market cap"]},
    {"id": "hotel", "name": "Hotel PMS", "icon": "🏨", "queries": ["hotel PMS software sector", "hospitality tech Mews Cloudbeds market", "hotel property management software analyst", "Mews Guesty funding"]},
    {"id": "document", "name": "Document & E-Sign", "icon": "📄", "queries": ["e-signature DocuSign sector analyst", "document management software market"]},
    {"id": "ecommerce", "name": "E-Commerce & Retail SaaS", "icon": "🛒", "queries": ["e-commerce SaaS Shopify sector analyst", "retail software market outlook"]},
    {"id": "consolidators", "name": "SaaS Software Consolidators", "icon": "🏢", "queries": ["software consolidator Constellation Volaris", "vertical software M&A market", "Constellation Software CSU analyst", "software roll-up acquisition"]},
]

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "sector_news.json"
MAX_PER_QUERY = 12  # Fetch more raw results; filter reduces to value/valuation/stock only
MAX_PER_SECTOR = 15

# CRITICAL: Only news about sector value, valuation, or stock performance qualifies.
VALUE_VALUATION_STOCK_PATTERN = re.compile(
    r"\b(valuation|valuations|value|valued|market cap|market value|"
    r"stock|stocks|share price|shares|equity|ticker|trading|traded|"
    r"analyst|analysts|earnings|revenue|growth|outlook|"
    r"price target|downgrade|upgrade|downgraded|upgraded|"
    r"multiple|P/E|forward revenue|ARR|"
    r"selloff|sell-off|crash|drop|decline|rally)\b",
    re.I,
)


def _qualifies(article: dict) -> bool:
    """CRITICAL guardrail: only include if about sector value, valuation, or stock performance."""
    title = (article.get("title") or "").lower()
    body = (article.get("body") or "").lower()
    text = f"{title} {body}"
    return bool(VALUE_VALUATION_STOCK_PATTERN.search(text))


def _search_news(query: str, max_results: int = MAX_PER_QUERY) -> list[dict]:
    """Search DuckDuckGo news. Returns list of {title, url, date, body}."""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.news(query, max_results=max_results))
    except Exception as e:
        print(f"    ⚠ Search error: {e}")
        return []

    out = []
    for r in results:
        title = (r.get("title") or "").strip()
        url = r.get("url") or r.get("link") or ""
        date = r.get("date") or r.get("published") or ""
        body = (r.get("body") or r.get("snippet") or "").strip()[:300]
        if title and url:
            out.append({"title": title, "url": url, "date": date, "body": body})
    return out


def _dedupe_by_url(articles: list[dict]) -> list[dict]:
    seen = set()
    out = []
    for a in articles:
        u = (a.get("url") or "").strip()
        if u and u not in seen:
            seen.add(u)
            out.append(a)
    return out


def _parse_date(s: str) -> str:
    """Extract YYYY-MM-DD from date string if possible."""
    if not s:
        return ""
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", s)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    m = re.search(r"(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})", s)
    if m:
        return f"{m.group(3)}-{m.group(1).zfill(2)}-{m.group(2).zfill(2)}"
    return s[:10] if s else ""


def _is_within_month(date_str: str) -> bool:
    """Return True if date is within the last 30 days. Drops articles with missing/unparseable dates."""
    parsed = _parse_date(date_str)
    if not parsed or len(parsed) < 10:
        return False
    try:
        article_date = datetime.strptime(parsed[:10], "%Y-%m-%d").date()
        cutoff = (datetime.now() - timedelta(days=30)).date()
        return article_date >= cutoff
    except ValueError:
        return False


def fetch_sector_news():
    """Fetch news for each sector. Writes to data/sector_news.json."""
    DATA_DIR.mkdir(exist_ok=True)

    print("Fetching sector news (analyst & market view) via web search...")
    print(f"  Sectors: {len(SECTORS)} | Run: npm run fetch:sector-news\n")

    result = {
        "fetched_at": datetime.now().isoformat(),
        "description": "Analyst and market news per sector. Run periodically: npm run fetch:sector-news",
        "sectors": {},
    }

    for sector in SECTORS:
        sector_id = sector["id"]
        sector_name = sector["name"]
        all_articles = []

        for q in sector["queries"]:
            articles = _search_news(q)
            for a in articles:
                a["date"] = _parse_date(a.get("date", "")) or a.get("date", "")
            all_articles.extend(articles)
            time.sleep(1)  # Be nice to DuckDuckGo

        # CRITICAL: Filter to only value/valuation/stock-performance news, max 30 days old
        qualified = [a for a in all_articles if _qualifies(a) and _is_within_month(a.get("date", ""))]
        unique = _dedupe_by_url(qualified)[:MAX_PER_SECTOR]

        result["sectors"][sector_id] = {
            "name": sector_name,
            "icon": sector["icon"],
            "articles": unique,
        }
        print(f"  ✅ {sector_name}: {len(unique)} article(s)")

    with open(OUTPUT_FILE, "w") as f:
        json.dump(result, f, indent=2)

    total = sum(len(s["articles"]) for s in result["sectors"].values())
    print(f"\n✅ Saved to {OUTPUT_FILE}")
    print(f"   {len(result['sectors'])} sectors, {total} total articles")
    return result


if __name__ == "__main__":
    fetch_sector_news()
