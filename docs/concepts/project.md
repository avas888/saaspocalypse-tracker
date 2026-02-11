# Project Management

**Sector ID:** `project`  
**Severity:** Catastrophic  
**Key insight:** Asana at -92% from its all-time high is the most extreme SaaSpocalypse casualty. Project management is the canonical "CRUD app with a UI" that Nadella described.

## Thesis

UI wrappers on task databases — Nadella's "CRUD apps" in their purest form. If an agent coordinates work, assigns tasks, and tracks progress, the visual interface is optional. SMB teams are the first to ditch the subscription.

## Defensibility

| Factor | Assessment |
|--------|------------|
| Moat | Very Low |
| Seat exposure | Extreme |
| Regulatory shield | None |

## Companies Followed

### Public (price-tracked)

| Ticker | Company | Exchange | Notes |
|--------|---------|----------|-------|
| ASAN | Asana | NYSE | -92% from ATH. The single most punished SaaS stock in the SaaSpocalypse. |
| SMAR | Smartsheet | NYSE | Spreadsheet-based PM. Highly commoditizable by any AI that can manage a to-do list. |
| MNDY | monday.com | NASDAQ | Also in CRM — "Work OS" spans both categories. Equally vulnerable in each. |

### Private (mentioned, not price-tracked)

| Company | Notes |
|---------|-------|
| ClickUp | Raised $400M at $4B. Private = shielded from selloff but faces same existential risk. |
| Notion | Pivoting toward AI-native workspace. Better positioned than pure PM tools. |

## Data Source

- **Backend:** `backend/fetch_prices.py` → `TICKERS`, `SECTORS["project"]`
- **Frontend:** `frontend/src/sectors.js` → `companies` array in Project Management sector
