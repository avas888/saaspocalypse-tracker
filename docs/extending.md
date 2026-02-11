# Adding or Removing Tickers

Tickers are defined in **two places** that must stay in sync. For sector rationale and the full list of companies per category (public + private), see [docs/concepts/](concepts/README.md).

## Backend: `backend/fetch_prices.py`

**`TICKERS` dict:** Maps ticker symbol → company name + primary sector.

```python
TICKERS = {
    "NEWTICKER": {"name": "New Company", "sector": "crm"},
    # ...
}
```

**`SECTORS` dict:** Lists which tickers contribute to each sector's average.

```python
SECTORS = {
    "crm": {"name": "CRM & Sales", "tickers": ["HUBS", "MNDY", "CRM", "FRSH", "NEWTICKER"]},
    # ...
}
```

## Frontend: `frontend/src/sectors.js`

Add the company to the appropriate sector's `companies` array:

```javascript
{ name: "New Company", ticker: "NEWTICKER", drop: -25, status: "public",
  note: "Description of the company and its relevance." },
```

### Analyst detail (optional)

```javascript
{ name: "New Company", ticker: "NEWTICKER", drop: -25, status: "public",
  note: "Description.",
  analystDetail: {
    consensus: "Buy", targetMedian: "$150", targetRange: "$120–$180", analystCount: 20,
    consensusDate: "Feb 2026",   // optional; date of analyst consensus
    bullCaseDate: "Feb 2026",    // optional; date of bull case opinions (can vary)
    bearCaseDate: "Jan 2026",   // optional; date of bear case opinions (can vary)
    bullCase: "...",
    bearCase: "...",
    verdict: "MOSTLY HYPE — ...",
    sentiment: "green"          // optional: "red" | "yellow" | "green"; overall sentiment
  }
},
```

**Date fields:** Use human-readable formats (e.g. `"Feb 2026"`, `"Jan 15, 2026"`, `"Q1 2026"`). Bull and bear case dates can differ when opinions are from different periods.

**Sentiment semaphore:** Overall sentiment as a compendium of all reviewed opinions. If `sentiment` is omitted, it is derived from the verdict prefix:

- `MOSTLY HYPE` → green (disruption risk overhyped)
- `MOSTLY REAL` / `REAL ECONOMICS` (standalone) → red (structural risk is real)
- `REAL ECONOMICS + HYPE` / `MIXED` → yellow

## After changes

```bash
rm data/2026-02-11.json   # if you need that date re-fetched
npm run fetch:backfill
```

---

# Adding a New Sector

1. **`backend/fetch_prices.py`:** Add entry to `SECTORS` dict with unique ID and ticker list.
2. **`frontend/src/sectors.js`:** Add full sector object (id, name, icon, severity, avgDrop, color, thesis, companies, keyInsight).
3. **`frontend/src/Tracker.jsx`:** Add sector ID to `SECTOR_ORDER` array (controls row order in tracker table).
