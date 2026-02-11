# SMB Payroll & HR

**Sector ID:** `payroll`  
**Severity:** Moderate  
**Key insight:** THIS IS THE MOST MISUNDERSTOOD SECTOR IN THE SAASPOCALYPSE. Every other vertical is falling because AI threatens to replace the SOFTWARE. Payroll is falling because AI threatens to replace the WORKERS who get paid through the software.

## Thesis

**CRITICAL DISTINCTION:** Payroll stocks aren't falling because AI replaces payroll SOFTWARE. They're falling because AI replaces JOBS — and fewer employees means fewer paychecks to process. This is a macro employment fear, not a software disruption story. The software itself is arguably MORE necessary in a complex, AI-reshuffled labor market.

## Defensibility

| Factor | Assessment |
|--------|------------|
| Moat | Very High |
| Seat exposure | Low |
| Regulatory shield | Very High |

## Companies Followed

### Public (price-tracked)

| Ticker | Company | Exchange | Notes |
|--------|---------|----------|-------|
| ADP | ADP (RUN) | NASDAQ | SMB product RUN. 50+ years dividends. 140 countries. Maximum regulatory moat. |
| PAYX | Paychex | NASDAQ | ~730K SMB clients. Benefits, HR, payroll bundle. Defensive, recession-resilient. |
| PAYC | Paycom | NYSE | Already sells outcomes (Beti automates payroll). Drop = macro fear, not disruption. |
| PCTY | Paylocity | NASDAQ | 14% recurring revenue growth, 35.9% EBITDA margins. Raised revenue target $2B→$3B. |
| XYZ | Block (Square) | NYSE | Square Payroll. Part of Block. Integrated with POS. Restaurant/retail focused. |

### Private (mentioned, not price-tracked)

| Company | Notes |
|---------|-------|
| Gusto | 400K+ SMB customers. $9.5B valuation. "People platform for Main Street." US-focused, sticky. |
| Rippling | $13.5B valuation. HR + IT + payroll unified. 160+ countries. Fast-growing, shielded from selloff. |
| Deel | Global payroll/EOR in 150+ countries. $12B valuation. Growing rapidly in distributed teams. |
| Personio | €8.5B. European SMB HR + payroll. EU labor law complexity = natural moat. |
| OnPay | Affordable US SMB payroll. Niche focus on farms, restaurants, nonprofits. |
| CONTPAQi Nómina | Mexico. CFDI payroll timbrado (mandatory SAT certification). Impossible for generic AI. |

## Data Source

- **Backend:** `backend/fetch_prices.py` → `TICKERS`, `SECTORS["payroll"]`
- **Frontend:** `frontend/src/sectors.js` → `companies` array in SMB Payroll & HR sector
