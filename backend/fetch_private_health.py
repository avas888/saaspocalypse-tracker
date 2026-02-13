#!/usr/bin/env python3
"""
SaaSpocalypse Private Cos Health Fetcher

Fetches publicly available health indicators for private companies:
- Financing rounds (up/down rounds)
- Acquisitions
- Valuation changes
- Other relevant news

Uses NewsAPI (newsapi.org) — requires NEWS_API_KEY env var.
Free tier: 100 requests/day. Run periodically (e.g. weekly): python fetch_private_health.py

Output: data/private_health.json — merged into Private Cos UI. Only companies with
relevant news get bullets; each bullet includes date, source, and clickable URL.
"""

import json
import os
import re
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# Private company names from sectors.js (status: "private")
PRIVATE_COMPANIES = [
    "Pipedrive", "Zoho CRM", "ClickUp", "Notion",
    "FreshBooks", "Wave", "CONTPAQi", "Nubox", "Colppy", "Bind ERP", "Zoho Books",
    "Gusto", "Rippling", "Deel", "Personio", "OnPay", "CONTPAQi Nómina",
    "SpotOn", "HungerRush",
    "Cloudbeds", "Mews", "Guesty", "Apaleo", "StayNTouch",
    "PandaDoc",
]

# Keywords that indicate relevant health/funding news
RELEVANT_KEYWORDS = re.compile(
    r"\b(funding|raised|raise|acquisition|acquired|acquirer|valuation|"
    r"series [a-d]|seed round|down round|up round|layoff|layoffs|"
    r"ipo|merger|invest|investment|venture|vc|private equity)\b",
    re.I,
)

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "private_health.json"


def _get_api_key() -> str | None:
    return os.environ.get("NEWS_API_KEY") or os.environ.get("NEWSAPI_KEY")


def _search_news(company: str, api_key: str, from_date: str) -> list[dict]:
    """Search NewsAPI for company + funding-related terms. Returns list of articles."""
    # Strip accents/special chars for search; keep base name
    search_name = company.split()[0] if company else ""
    if not search_name:
        return []

    query = f'"{search_name}" (funding OR raised OR acquisition OR acquired OR valuation OR "down round" OR "up round")'
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "from": from_date,
        "sortBy": "publishedAt",
        "pageSize": 5,
        "language": "en",
        "apiKey": api_key,
    }

    try:
        r = requests.get(url, params=params, timeout=15)
        r.raise_for_status()
        data = r.json()
        return data.get("articles") or []
    except requests.exceptions.RequestException as e:
        print(f"  ⚠ {company}: API error — {e}")
        return []
    except json.JSONDecodeError:
        return []


def _is_relevant(article: dict, company: str) -> bool:
    """Check if article title/description contains relevant keywords."""
    title = (article.get("title") or "").lower()
    desc = (article.get("description") or "").lower()
    text = f"{title} {desc}"
    if not RELEVANT_KEYWORDS.search(text):
        return False
    # Avoid articles about unrelated companies with same word (e.g. "Wave" physics)
    search_name = company.split()[0].lower()
    if search_name in ("wave", "notion", "spot", "cloud", "stay", "bind", "person"):
        # Require company name to appear
        if search_name not in text and company.lower() not in text:
            return False
    return True


def _format_article(article: dict) -> dict:
    """Extract date, summary, source, url from article."""
    pub = article.get("publishedAt") or ""
    date_str = pub[:10] if pub else ""
    return {
        "date": date_str,
        "summary": (article.get("title") or article.get("description") or "").strip()[:200],
        "source": (article.get("source") or {}).get("name") or "Unknown",
        "url": article.get("url") or "",
    }


def fetch_private_health():
    """Fetch health indicators for all private companies. Writes to data/private_health.json."""
    api_key = _get_api_key()
    if not api_key:
        print("❌ NEWS_API_KEY not set. Get a free key at https://newsapi.org/register")
        print("   Then: export NEWS_API_KEY=your_key && python fetch_private_health.py")
        sys.exit(1)

    from_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
    DATA_DIR.mkdir(exist_ok=True)

    print("Fetching private company health indicators...")
    print(f"  From: {from_date} | Companies: {len(PRIVATE_COMPANIES)}\n")

    result = {
        "fetched_at": datetime.now().isoformat(),
        "description": "Health indicators for private SMB SaaS companies. Run periodically: npm run fetch:private",
        "companies": {},
    }

    for i, company in enumerate(PRIVATE_COMPANIES):
        articles = _search_news(company, api_key, from_date)
        relevant = [
            _format_article(a)
            for a in articles
            if _is_relevant(a, company) and a.get("url")
        ]
        # Dedupe by URL
        seen = set()
        unique = []
        for r in relevant:
            u = r.get("url", "")
            if u and u not in seen:
                seen.add(u)
                unique.append(r)

        if unique:
            result["companies"][company] = unique[:5]  # Max 5 per company
            print(f"  ✅ {company}: {len(unique)} item(s)")
        else:
            print(f"  ⏭ {company}: no relevant news")

        if i < len(PRIVATE_COMPANIES) - 1:
            time.sleep(0.5)  # Rate limit for free tier

    with open(OUTPUT_FILE, "w") as f:
        json.dump(result, f, indent=2)

    count = sum(len(v) for v in result["companies"].values())
    print(f"\n✅ Saved to {OUTPUT_FILE}")
    print(f"   {len(result['companies'])} companies with news, {count} total items")
    return result


if __name__ == "__main__":
    fetch_private_health()
