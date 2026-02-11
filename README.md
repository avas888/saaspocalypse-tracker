# SaaSpocalypse Tracker

Interactive analysis of the 2026 SaaS stock crash across 8 SMB verticals, 60+ companies. Includes a daily price tracker that auto-consolidates: days → weeks → months.

## Quick Start

```bash
# 1. Install frontend dependencies
npm install

# 2. Install Python dependencies and set up FMP API key
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your FMP_API_KEY (get one at financialmodelingprep.com)

# 3. Backfill prices from Feb 3, 2026 to today
npm run fetch:backfill

# 4. Start the dev server
npm run dev
```

Open http://localhost:5173

## Daily Usage

```bash
# Fetch today's closing prices (run after 4pm ET)
npm run fetch

# Force re-fetch today's data
npm run fetch:force
```

## Auto-fetch (optional cron)

To auto-fetch daily at 5pm ET:

```bash
crontab -e
# Add this line (adjust path):
0 17 * * 1-5 cd /path/to/saaspocalypse-tracker && npm run fetch
```

## How the Tracker Works

**Consolidation logic:**
- **Days 1-7**: Show as individual columns (Mon, Tue, Wed...)
- **Day 8**: Days 1-7 collapse into "Wk 1" showing cumulative % change
- **After 4 weeks**: Weeks 1-4 collapse into "Mo 1" showing cumulative %
- **Continues**: Months accumulate as weeks keep consolidating

**Data flow:**
```
FMP API → backend/fetch_prices.py → data/2026-02-11.json → React reads via /api/data/
```

Each daily JSON contains per-ticker closing prices + daily % change, and pre-computed sector averages.

## Project Structure

```
saaspocalypse-tracker/
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main app (all existing tabs + Tracker)
│   │   ├── Tracker.jsx      # Daily tracker with consolidation
│   │   ├── sectors.js       # Sector/company data + analyst deep dives
│   │   └── main.jsx         # React entry point
│   └── index.html
├── backend/
│   ├── fetch_prices.py      # FMP API price fetcher
│   └── fmp_fetcher.py       # FMP API client
├── data/                     # JSON price snapshots (gitignored if desired)
│   ├── baseline.json         # Feb 3, 2026 opening prices
   │   ├── 2026-02-03.json       # Daily snapshots
│   ├── 2026-02-11.json
│   └── ...
├── vite.config.js            # Vite + data API plugin
├── server.js                  # Production server (static + /api/data)
├── docs/                      # Documentation
│   ├── README.md              # Docs index
│   ├── concepts/              # Conceptual docs: companies per category
│   ├── architecture.md        # System overview
│   ├── ops-guide.md           # Operations manual
│   ├── deployment.md          # Railway deployment
│   └── ...
├── package.json
└── README.md
```

## Production

```bash
npm run build
npm start
```

Serves at http://localhost:3000. For Railway deployment, see [docs/deployment.md](docs/deployment.md).

## Tracked Tickers (28)

For sector-level rationale and companies per category (including private), see [docs/concepts/](docs/concepts/README.md).

| Sector | Tickers |
|--------|---------|
| CRM & Sales | HUBS, MNDY, CRM, FRSH |
| Project Management | ASAN, SMAR |
| SMB Accounting | INTU, XRO.AX, SGE.L, TOTS3.SA, 4478.T |
| SMB Payroll | ADP, PAYX, PAYC, PCTY, XYZ |
| Restaurant POS | TOST, XYZ, LSPD, FI, DASH |
| Hotel PMS | AGYS |
| Document & E-Sign | DOCU, DBX |
| E-Commerce | SHOP, BIGC, WIX, SQSP, VTEX |

## Not Financial Advice

This is a research/analysis tool. Data sourced from [Financial Modeling Prep](https://financialmodelingprep.com/) with Yahoo Finance fallback for tickers unavailable on FMP.
