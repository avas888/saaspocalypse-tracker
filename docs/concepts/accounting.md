# SMB Accounting

**Sector ID:** `accounting`  
**Severity:** Moderate  
**Key insight:** The gradient within accounting is dramatic. US-centric tools are hit hard because US bookkeeping is relatively standardized — an AI can plausibly do it. But every step toward local regulatory complexity adds protection.

## Thesis

Partial regulatory shield. Tax codes, GAAP/IFRS, country-specific filing requirements create real friction. But Nadella's thesis is precise: agents can DO the bookkeeping directly. The moat depends on geography — stronger in Brazil/Mexico than in the US.

## Defensibility

| Factor | Assessment |
|--------|------------|
| Moat | Medium-High |
| Seat exposure | Medium |
| Regulatory shield | High |

## Companies Followed

### Public (price-tracked)

| Ticker | Company | Exchange | Notes |
|--------|---------|----------|-------|
| INTU | Intuit (QBO) | NASDAQ | QuickBooks dominates US SMB (~62% share). P/E compressed 38% despite 12-13% revenue growth. |
| XRO.AX | Xero | ASX | NZ/Australia leader. Worst day since March 2020. Was trading at 102x earnings pre-crash. |
| SGE.L | Sage Group | LSE | UK/Europe. Most resilient — Making Tax Digital in UK = moat. 10% organic growth. |
| TOTS3.SA | TOTVS | B3 | Brazil leader (~50% market share). 27% ARR growth. Brazilian tax complexity = fortress. |
| 4478.T | freee | TSE | Japan SMB accounting + payroll. Complex Japanese tax system = significant barrier for AI. |

### Private (mentioned, not price-tracked)

| Company | Notes |
|---------|-------|
| FreshBooks | Popular with freelancers/micro-businesses. Invoicing-centric — more vulnerable than full accounting. |
| Wave | Free accounting for micro-businesses. Owned by H&R Block. Revenue = payments, not seats. |
| CONTPAQi | Mexico leader. CFDI electronic invoicing compliance. SAT certification. Deep regulatory moat. |
| Nubox | Chile SMB accounting. Chilean tax compliance requirements. Private, locally entrenched. |
| Colppy | Argentina SMB accounting. AFIP compliance, inflation-adjusted bookkeeping. Hyper-local. |
| Bind ERP | Mexico (part of SUMA group). Cloud ERP for Mexican SMBs. SAT/CFDI integrated. |
| Zoho Books | Part of Zoho's 45+ app ecosystem. Aiming at SMBs globally. No public market exposure. |

## Data Source

- **Backend:** `backend/fetch_prices.py` → `TICKERS`, `SECTORS["accounting"]`
- **Frontend:** `frontend/src/sectors.js` → `companies` array in SMB Accounting sector
