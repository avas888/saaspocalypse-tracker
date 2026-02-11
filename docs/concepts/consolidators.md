# SaaS Software Consolidators

**Sector ID:** `consolidators`  
**Severity:** Low  
**Key insight:** Software consolidators acquire vertical-market software businesses and operate them for cash flow. They are not direct per-seat SaaS vendors; their portfolio companies may face SaaSpocalypse risk, but the consolidator model itself is different. Constellation Software (Canada) is the archetype.

## Thesis

Acquirers of vertical-market software. Not per-seat SaaS vendors — they buy and operate businesses for cash flow. Their portfolio companies may face SaaSpocalypse risk, but the consolidator model itself is different. Constellation Software (Canada) is the archetype. AI disruption affects targets, but as acquirers they may benefit from cheaper acquisition multiples during a selloff.

## Defensibility

| Factor | Assessment |
|--------|------------|
| Moat | High |
| Seat exposure | Low |
| Regulatory shield | Medium |

## Companies Followed

### Public (price-tracked)

| Ticker | Company | Exchange | Notes |
|--------|---------|----------|-------|
| CSU.TO | Constellation Software | TSX | Canada's largest; ~$100B+ market cap. Volaris, Harris, Topicus operating groups. Archetype of the software consolidator model. |
| DSG.TO | Descartes Systems | TSX | Canada. Logistics/supply chain software consolidator. |
| TYL | Tyler Technologies | NYSE | US. Government/education vertical software. |
| OTEX | OpenText | NASDAQ | Enterprise information management. Acquisitive. |
| ASUR | Asure Software | NASDAQ | Workforce management. HR/payroll vertical. |
| UPLD | Upland Software | NASDAQ | Productivity/workflow software roll-up. |

### Private (mentioned, not price-tracked)

| Company | Notes |
|---------|-------|
| Vista Equity Partners | Private PE. Software-focused. Not a public consolidator. |
| Thoma Bravo | Private PE. Software-focused. Not a public consolidator. |

## Data Source

- **Backend:** `backend/fetch_prices.py` → `TICKERS`, `SECTORS["consolidators"]`
- **Frontend:** `frontend/src/sectors.js` → `companies` array in consolidators sector
