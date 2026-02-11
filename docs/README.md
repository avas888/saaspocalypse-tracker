# SaaSpocalypse Tracker — Documentation

Central index for all project documentation.

## Quick Links

| Doc | Description |
|-----|-------------|
| [architecture.md](architecture.md) | System overview, data flow, dev vs production |
| [ops-guide.md](ops-guide.md) | Full operations manual: setup, daily ops, cron |
| [deployment.md](deployment.md) | Railway deployment (ready when you are) |
| [data-format.md](data-format.md) | JSON schema for snapshots and baseline |
| [extending.md](extending.md) | Adding tickers and sectors |
| [troubleshooting.md](troubleshooting.md) | Common issues and known limitations |

## Conceptual Documentation — Companies per Category

Sector-level conceptual docs describing the thesis, defensibility, and companies followed (public + private) for each category:

| Sector | Doc | Public Tickers |
|--------|-----|----------------|
| [CRM & Sales](concepts/crm.md) | crm | HUBS, MNDY, CRM, FRSH |
| [Project Management](concepts/project.md) | project | ASAN, SMAR, MNDY |
| [SMB Accounting](concepts/accounting.md) | accounting | INTU, XRO.AX, SGE.L, TOTS3.SA, 4478.T |
| [SMB Payroll & HR](concepts/payroll.md) | payroll | ADP, PAYX, PAYC, PCTY, XYZ |
| [Restaurant POS](concepts/pos.md) | pos | TOST, XYZ, LSPD, FI, DASH |
| [Hotel PMS](concepts/hotel.md) | hotel | AGYS |
| [Document & E-Sign](concepts/document.md) | document | DOCU, DBX |
| [E-Commerce & Retail SaaS](concepts/ecommerce.md) | ecommerce | SHOP, BIGC, WIX, SQSP, VTEX |

Full index: [concepts/README.md](concepts/README.md)

## CLI Quick Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install Node.js dependencies |
| `npm run dev` | Start dev server (http://localhost:5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run fetch` | Fetch today's closing prices |
| `npm run fetch:force` | Force re-fetch today's prices |
| `npm run fetch:backfill` | Backfill from Feb 3 to today |
| `npm run fetch:ltm` | Fetch LTM high % (pre-SaaSpocalypse peak) |
