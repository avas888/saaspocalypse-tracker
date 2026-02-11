# Data Format Reference

Data is sourced from the [Financial Modeling Prep](https://financialmodelingprep.com/) API via `fetch_prices.py`.

## Daily snapshot: `data/YYYY-MM-DD.json`

```json
{
  "date": "2026-02-11",
  "fetched_at": "2026-02-11T17:05:23",
  "tickers": {
    "HUBS": {
      "name": "HubSpot",
      "sector": "crm",
      "close": 292.50,
      "prev_close": 305.20,
      "daily_pct": -4.16
    }
  },
  "sectors": {
    "crm": {
      "name": "CRM & Sales",
      "avg_daily_pct": -5.97,
      "tickers_tracked": 4,
      "tickers_total": 4
    }
  }
}
```

## Baseline: `data/baseline.json`

Defines the SaaSpocalypse base date prices. All cumulative % changes are computed from this baseline.

```json
{
  "date": "2026-02-03",
  "fetched_at": "2026-02-11T14:30:00",
  "description": "SaaSpocalypse baseline — prices as of market open Feb 3, 2026",
  "tickers": {
    "HUBS": {
      "name": "HubSpot",
      "sector": "crm",
      "price": 310.40
    }
  }
}
```

**Cumulative tracking:** The Tracker displays `(current_close - base_price) / base_price * 100` for each ticker and sector. If `baseline.json` is missing, the frontend falls back to the first day's `prev_close` (pre-crash price).

## Data API

| Endpoint | Response |
|----------|----------|
| `GET /api/data/` | `{ "files": ["2026-02-03.json", "2026-02-11.json", ...] }` |
| `GET /api/data/2026-02-11.json` | Full JSON snapshot |

The API lists `.json` files in `data/` and serves individual files. Baseline is included in the list but filtered client-side for daily snapshots.

## Tracked Tickers

28 public tickers across 8 sectors. For sector-level rationale and companies per category (including private), see [docs/concepts/](concepts/README.md).

| Ticker | Company | Sector(s) | Exchange |
|--------|---------|-----------|----------|
| HUBS | HubSpot | CRM | NASDAQ |
| MNDY | monday.com | CRM, Project Mgmt | NASDAQ |
| CRM | Salesforce | CRM | NYSE |
| FRSH | Freshworks | CRM | NASDAQ |
| ASAN | Asana | Project Mgmt | NYSE |
| SMAR | Smartsheet | Project Mgmt | NYSE |
| INTU | Intuit | Accounting | NASDAQ |
| XRO.AX | Xero | Accounting | ASX |
| SGE.L | Sage Group | Accounting | LSE |
| TOTS3.SA | TOTVS | Accounting | B3 |
| 4478.T | freee | Accounting | TSE |
| ADP | ADP | Payroll | NASDAQ |
| PAYX | Paychex | Payroll | NASDAQ |
| PAYC | Paycom | Payroll | NYSE |
| PCTY | Paylocity | Payroll | NASDAQ |
| XYZ | Block (Square) | Payroll, POS | NYSE |
| TOST | Toast | POS | NYSE |
| LSPD | Lightspeed | POS | NYSE |
| FI | Fiserv (Clover) | POS | NYSE |
| DASH | DoorDash (Otter) | POS | NASDAQ |
| AGYS | Agilysys | Hotel PMS | NASDAQ |
| DOCU | DocuSign | Document | NASDAQ |
| DBX | Dropbox | Document | NASDAQ |
| SHOP | Shopify | E-Commerce | NYSE |
| BIGC | BigCommerce | E-Commerce | NASDAQ |
| WIX | Wix | E-Commerce | NASDAQ |
| SQSP | Squarespace | E-Commerce | NYSE |
| VTEX | VTEX | E-Commerce | NYSE |
