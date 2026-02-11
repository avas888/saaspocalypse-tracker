# Restaurant POS

**Sector ID:** `pos`  
**Severity:** Low  
**Key insight:** Restaurant POS is the anti-SaaSpocalypse. These companies are intertwined with physical operations: hardware terminals, kitchen displays, payment processing, tip management, inventory. You cannot replace a POS terminal with a chatbot.

## Thesis

Hardware + payments + operations = triple moat. You can't "vibe code" a kitchen display system or payment terminal. POS is embedded in physical operations — orders, tips, inventory, labor. AI ENHANCES these platforms (menu optimization, demand forecasting) rather than replacing them.

## Defensibility

| Factor | Assessment |
|--------|------------|
| Moat | Very High |
| Seat exposure | None |
| Regulatory shield | Medium |

## Companies Followed

### Public (price-tracked)

| Ticker | Company | Exchange | Notes |
|--------|---------|----------|-------|
| TOST | Toast | NYSE | Restaurant-specific POS. $14B market cap. 25% YoY growth. AI for menu/labor analytics. |
| XYZ | Block (Square) | NYSE | POS + payments + payroll + lending. Hardware moat. Broad SMB ecosystem. |
| LSPD | Lightspeed | NYSE | Restaurant + retail POS. Multi-location inventory. More volatile, smaller. |
| FI | Fiserv (Clover) | NYSE | Clover is Fiserv's SMB POS. Parent company is a $90B fintech giant — minimal SaaS exposure. |
| DASH | DoorDash (Otter) | NASDAQ | Delivery aggregator + POS layer. Owned by DoorDash. Multi-channel order unification. |

### Private (mentioned, not price-tracked)

| Company | Notes |
|---------|-------|
| SpotOn | Restaurant POS challenger. Private. Staff scheduling + reservation integration. |
| HungerRush | QSR/pizza focused POS. AI voice ordering for drive-thrus. Private. |

## Data Source

- **Backend:** `backend/fetch_prices.py` → `TICKERS`, `SECTORS["pos"]`
- **Frontend:** `frontend/src/sectors.js` → `companies` array in Restaurant POS sector
