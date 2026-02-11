# Architecture Overview

The project is a two-part system: a **Python data fetcher** that snapshots stock prices into JSON files, and a **React (Vite) frontend** that reads those files via an API and renders an interactive dashboard with auto-consolidating timeline views.

**Conceptual docs:** Sector-level descriptions of companies per category live in [docs/concepts/](concepts/README.md).

## Project Structure

```
saaspocalypse-tracker/
├── frontend/                    # React + Vite application
│   ├── index.html
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx               # Main app (5 tabs, all analysis views)
│       ├── Tracker.jsx           # Daily price grid with auto-consolidation
│       └── sectors.js            # Static sector/company metadata (see concepts/ for rationale)
├── backend/
│   ├── fetch_prices.py          # Python CLI: FMP API → data/
│   └── fmp_fetcher.py            # FMP API client
├── data/                         # JSON price snapshots (one file per trading day)
│   ├── baseline.json             # Feb 3, 2026 opening prices
   │   ├── 2026-02-03.json
│   └── ...
├── vite.config.js                # Vite + data API plugin
├── package.json
└── docs/
    ├── concepts/             # Conceptual docs: companies per category
    ├── architecture.md
    └── ...
```

## Data Flow

```
FMP API → fetch_prices.py → data/YYYY-MM-DD.json → API (/api/data/) → Tracker.jsx
```

The frontend and backend are fully decoupled. The fetcher writes JSON files to disk; the frontend reads them at runtime. No database, no auth.

## Modes

| Mode | Frontend | `/api/data` | Used For |
|------|----------|-------------|----------|
| **Dev** | Vite dev server | Vite plugin (`configureServer`) | Local development |
| **Preview** | Vite preview | Vite plugin (`configurePreviewServer`) | Local production-like test |
| **Production** | Express serves `dist/` | Express route | Railway / deployed |

## Prerequisites

| Dependency | Minimum | Verify |
|------------|---------|--------|
| Node.js | 18.x+ | `node --version` |
| npm | 9.x+ | `npm --version` |
| Python | 3.9+ | `python3 --version` |
| requests | 2.28+ | `pip show requests` |
| python-dotenv | 1.0+ | `pip show python-dotenv` |
| FMP_API_KEY | — | Set in `.env` (see [ops-guide.md](ops-guide.md)) |
