# E-Commerce & Retail SaaS

**Sector ID:** `ecommerce`  
**Severity:** Moderate  
**Key insight:** Shopify is the standout because it's become a full operating system for merchants — not just a storefront but payments, shipping, POS hardware, lending, and fulfillment. That ecosystem creates genuine lock-in. But the lighter website builders (Wix, Squarespace) face real pressure from "vibe coding."

## Thesis

Mixed bag. Shopify has deep merchant lock-in + payments + hardware (POS terminals). But lighter tools (website builders, marketing automation) face commoditization from AI that can "vibe code" a storefront.

## Defensibility

| Factor | Assessment |
|--------|------------|
| Moat | Medium-High |
| Seat exposure | Low |
| Regulatory shield | Low |

## Companies Followed

### Public (price-tracked)

| Ticker | Company | Exchange | Notes |
|--------|---------|----------|-------|
| SHOP | Shopify | NYSE | Merchant ecosystem + payments + shipping + POS hardware. Relatively defensive for SMB SaaS. |
| BIGC | BigCommerce | NASDAQ | Smaller competitor. Less ecosystem lock-in than Shopify. More vulnerable. |
| WIX | Wix | NASDAQ | Website builder + e-commerce. AI can now build sites from a prompt — direct threat. |
| SQSP | Squarespace | NYSE | Design-focused sites. Went private via Permira buyout 2024. Re-listed. Vulnerable to vibe coding. |
| VTEX | VTEX | NYSE | LatAm e-commerce platform. Regional focus provides some protection. |

### Private (mentioned, not price-tracked)

None currently — e-commerce public companies dominate the tracked list.

## Data Source

- **Backend:** `backend/fetch_prices.py` → `TICKERS`, `SECTORS["ecommerce"]`
- **Frontend:** `frontend/src/sectors.js` → `companies` array in E-Commerce & Retail SaaS sector
