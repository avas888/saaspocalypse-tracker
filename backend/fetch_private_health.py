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
    "FreshBooks", "Wave", "CONTPAQi", "SIIGO", "Nubox", "Colppy", "Bind ERP", "Alegra", "Zoho Books",
    "Gusto", "Rippling", "Deel", "Personio", "OnPay", "CONTPAQi Nómina", "Buk",
    "SpotOn", "HungerRush",
    "Cloudbeds", "Mews", "Guesty", "Apaleo", "StayNTouch",
    "PandaDoc",
]

# LATAM companies — also search Spanish/Portuguese sources
LATAM_COMPANIES = {"CONTPAQi", "SIIGO", "Nubox", "Colppy", "Bind ERP", "Alegra", "CONTPAQi Nómina", "Buk"}

# Keywords that indicate relevant health/funding news (English)
RELEVANT_KEYWORDS = re.compile(
    r"\b(funding|raised|raise|acquisition|acquired|acquirer|valuation|"
    r"series [a-d]|seed round|down round|up round|layoff|layoffs|"
    r"ipo|merger|invest|investment|venture|vc|private equity)\b",
    re.I,
)

# Spanish/Portuguese keywords for LATAM articles
RELEVANT_KEYWORDS_ES_PT = re.compile(
    r"\b(financiamiento|financiación|inversión|inversão|adquisición|aquisição|"
    r"valoración|valoração|valuación|ronda|funding|levantamiento|levantou|"
    r"fusion|fusão|merger|venture|capital|private equity|"
    r"despidos|demissões|layoff|serie [a-d]|seed)\b",
    re.I,
)

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "private_health.json"


def _get_api_key() -> str | None:
    return os.environ.get("NEWS_API_KEY") or os.environ.get("NEWSAPI_KEY")


def _search_news(company: str, api_key: str, from_date: str, language: str = "en") -> list[dict]:
    """Search NewsAPI for company + funding-related terms. Returns list of articles."""
    # Strip accents/special chars for search; keep base name
    search_name = company.split()[0] if company else ""
    if not search_name:
        return []

    if language == "en":
        query = f'"{search_name}" (funding OR raised OR acquisition OR acquired OR valuation OR "down round" OR "up round")'
    elif language == "es":
        query = f'"{search_name}" (financiamiento OR inversión OR adquisición OR valuation OR funding OR ronda)'
    else:
        # Portuguese (pt)
        query = f'"{search_name}" (financiamento OR inversão OR aquisição OR valuation OR funding OR ronda)'

    # top-headlines doesn't support language; for non-en go straight to everything
    endpoints = []
    if language == "en":
        endpoints.append((
            "https://newsapi.org/v2/top-headlines",
            {"q": search_name, "pageSize": 5, "apiKey": api_key},
        ))
    endpoints.append((
        "https://newsapi.org/v2/everything",
        {
            "q": query,
            "from": from_date,
            "sortBy": "publishedAt",
            "pageSize": 5,
            "language": language,
            "apiKey": api_key,
        },
    ))

    for url, params in endpoints:
        try:
            r = requests.get(url, params=params, timeout=15)
            if r.status_code == 426:
                continue  # Upgrade required, try next endpoint
            r.raise_for_status()
            data = r.json()
            articles = data.get("articles") or []
            if articles:
                return articles
        except requests.exceptions.RequestException as e:
            if "426" in str(e):
                continue
            print(f"  ⚠ {company}: API error — {e}")
            return []
        except json.JSONDecodeError:
            continue

    return []


def _is_relevant(article: dict, company: str, use_es_pt: bool = False) -> bool:
    """Check if article title/description contains relevant keywords."""
    title = (article.get("title") or "").lower()
    desc = (article.get("description") or "").lower()
    text = f"{title} {desc}"
    # LATAM companies: accept English OR Spanish/Portuguese keywords
    if use_es_pt:
        if not RELEVANT_KEYWORDS.search(text) and not RELEVANT_KEYWORDS_ES_PT.search(text):
            return False
    elif not RELEVANT_KEYWORDS.search(text):
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

    # Free tier: search up to 1 month old only
    from_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    DATA_DIR.mkdir(exist_ok=True)

    latam_only = "--latam-only" in sys.argv
    companies = [c for c in PRIVATE_COMPANIES if c in LATAM_COMPANIES] if latam_only else PRIVATE_COMPANIES

    print("Fetching private company health indicators...")
    if latam_only:
        print(f"  [LATAM only] Spanish + Portuguese sources included")
    print(f"  From: {from_date} | Companies: {len(companies)}\n")

    result = {
        "fetched_at": datetime.now().isoformat(),
        "description": "Health indicators for private SMB SaaS companies. Run periodically: npm run fetch:private",
        "companies": {},
    }

    for i, company in enumerate(companies):
        # English search for all; add Spanish/Portuguese for LATAM companies
        articles = _search_news(company, api_key, from_date, language="en")
        if company in LATAM_COMPANIES:
            for lang in ("es", "pt"):
                articles.extend(_search_news(company, api_key, from_date, language=lang))
                time.sleep(0.5)  # Rate limit between language requests

        use_es_pt = company in LATAM_COMPANIES
        relevant = [
            _format_article(a)
            for a in articles
            if _is_relevant(a, company, use_es_pt=use_es_pt) and a.get("url")
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

        if i < len(companies) - 1:
            time.sleep(0.5)  # Rate limit for free tier

    # When --latam-only, merge with existing file so we don't overwrite other companies
    if latam_only and OUTPUT_FILE.exists():
        try:
            existing = json.loads(OUTPUT_FILE.read_text())
            existing["companies"].update(result["companies"])
            result["companies"] = existing["companies"]
            result["fetched_at"] = datetime.now().isoformat()
        except (json.JSONDecodeError, OSError):
            pass

    with open(OUTPUT_FILE, "w") as f:
        json.dump(result, f, indent=2)

    count = sum(len(v) for v in result["companies"].values())
    print(f"\n✅ Saved to {OUTPUT_FILE}")
    print(f"   {len(result['companies'])} companies with news, {count} total items")
    return result


if __name__ == "__main__":
    fetch_private_health()
