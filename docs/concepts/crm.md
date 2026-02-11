# CRM & Sales

**Sector ID:** `crm`  
**Severity:** Catastrophic  
**Key insight:** CRM is the most exposed vertical because it embodies everything AI agents threaten: per-seat pricing, no regulatory requirements, general-purpose workflows, and data that agents can access directly from email and calendars.

## Thesis

The poster child of the per-seat model. If one AI agent handles a pipeline of 50 accounts, you don't need 50 Salesforce licenses. No regulatory moat. No compliance shield. Pure UI wrapper on a database — exactly what Nadella called "dead."

## Defensibility

| Factor | Assessment |
|--------|------------|
| Moat | Low |
| Seat exposure | Extreme |
| Regulatory shield | None |

## Companies Followed

### Public (price-tracked)

| Ticker | Company | Exchange | Notes |
|--------|---------|----------|-------|
| HUBS | HubSpot | NASDAQ | Worst-hit CRM. SMB focus = low switching costs. Customers can leave overnight. |
| MNDY | monday.com | NASDAQ | Launching AI Credits to replace seats. 21% single-day crash after earnings. Also in Project Management. |
| CRM | Salesforce | NYSE | 52-week low. Agentforce adoption disappointing. Existential: agents pull from Gmail/Slack directly. |
| FRSH | Freshworks | NASDAQ | Piper Sandler downgrade citing "seat compression and vibe coding." Indian-origin. |

### Private (mentioned, not price-tracked)

| Company | Notes |
|---------|-------|
| Pipedrive | Acquired by Vista Equity. SMB European CRM. Same existential risk, shielded from public panic. |
| Zoho CRM | 100M+ users. CEO called AI "the pin popping this inflated balloon." Private = no stock panic. |

## Data Source

- **Backend:** `backend/fetch_prices.py` → `TICKERS`, `SECTORS["crm"]`
- **Frontend:** `frontend/src/sectors.js` → `companies` array in CRM sector
