# Document & E-Sign

**Sector ID:** `document`  
**Severity:** Severe  
**Key insight:** DocuSign at -85% from its all-time high tells the story. E-signatures are the canonical "thin wrapper" — a feature, not a product. When AI agents can draft, negotiate, and execute agreements end-to-end, the standalone e-signature tool has no reason to exist as an independent subscription.

## Thesis

Thin workflow layers. E-signatures, contract management, and document routing are classic automation targets. If an AI agent generates, routes, and tracks a contract, the standalone tool disappears. Low regulatory moat despite the legal-adjacent positioning.

## Defensibility

| Factor | Assessment |
|--------|------------|
| Moat | Low |
| Seat exposure | High |
| Regulatory shield | Low |

## Companies Followed

### Public (price-tracked)

| Ticker | Company | Exchange | Notes |
|--------|---------|----------|-------|
| DOCU | DocuSign | NASDAQ | -85% from ATH. E-signature is a thin layer — AI generates AND routes the document. |
| DBX | Dropbox (Sign) | NASDAQ | Formerly HelloSign. Part of Dropbox. Storage moat helps but e-sign is vulnerable. |

### Private (mentioned, not price-tracked)

| Company | Notes |
|---------|-------|
| PandaDoc | SMB proposal/contract tool. Private. Faces same commoditization risk. |

## Data Source

- **Backend:** `backend/fetch_prices.py` → `TICKERS`, `SECTORS["document"]`
- **Frontend:** `frontend/src/sectors.js` → `companies` array in Document & E-Sign sector
