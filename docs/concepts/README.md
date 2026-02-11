# Sector Concepts — Companies per Category

Conceptual documentation for each SMB vertical tracked in the SaaSpocalypse Tracker. Each document describes the sector thesis, defensibility factors, and the companies followed (public and private).

## Index

| Sector | Doc | Severity | Public Tickers | Notes |
|--------|-----|----------|----------------|-------|
| [CRM & Sales](crm.md) | crm | Catastrophic | HUBS, MNDY, CRM, FRSH | Per-seat model most exposed |
| [Project Management](project.md) | project | Catastrophic | ASAN, SMAR, MNDY | "CRUD app" poster child |
| [SMB Accounting](accounting.md) | accounting | Moderate | INTU, XRO.AX, SGE.L, TOTS3.SA, 4478.T | Regulatory shield varies by geography |
| [SMB Payroll & HR](payroll.md) | payroll | Moderate | ADP, PAYX, PAYC, PCTY, XYZ | TAM-shrinkage fear, not software disruption |
| [Restaurant POS](pos.md) | pos | Low | TOST, XYZ, LSPD, FI, DASH | Hardware + payments = triple moat |
| [Hotel PMS](hotel.md) | hotel | Low | AGYS, SABR, SDR.AX | Safest sector; mostly private |
| [Document & E-Sign](document.md) | document | Severe | DOCU, DBX | Thin wrapper; AI subsumes workflow |
| [E-Commerce & Retail SaaS](ecommerce.md) | ecommerce | Moderate | SHOP, BIGC, WIX, SQSP, VTEX | Mixed: Shopify defensive, builders vulnerable |
| [SaaS Software Consolidators](consolidators.md) | consolidators | Low | CSU.TO, ASUR, UPLD | Acquirers of vertical software; different exposure |

## Cross-references

- **Data format:** See [data-format.md](../data-format.md) for JSON schema and ticker list.
- **Adding tickers:** See [extending.md](../extending.md) for how to add companies to a sector.
- **Backend config:** Tickers are defined in `backend/fetch_prices.py`; frontend metadata in `frontend/src/sectors.js`.
