# Hotel PMS

**Sector ID:** `hotel`  
**Severity:** Low  
**Key insight:** Hotel PMS is arguably the SAFEST sector in this analysis. Nearly all players are private (immune to public panic). The sector just saw its largest-ever funding round (Mews at $2.5B).

## Thesis

Hospitality's "mission control." Managing reservations, check-ins, housekeeping, channel distribution, payments, and compliance across hundreds of channels. Deeply operational, hardware-adjacent (key cards, kiosks), and mostly private companies. AI is an ACCELERANT here, not a threat.

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
| AGYS | Agilysys | NASDAQ | Only major public PMS pure-play. $150M spa acquisition. Mostly enterprise but SMB push. |
| SABR | Sabre | NASDAQ | SynXis Property Hub — cloud-native hotel PMS. Travel distribution + hospitality tech. |
| SDR.AX | SiteMinder | ASX | Hotel distribution + Little Hotelier PMS for small properties. |

### Private (mentioned, not price-tracked)

| Company | Notes |
|---------|-------|
| Cloudbeds | All-in-one PMS for independents. 157 countries. Launched "Signals" AI for demand forecasting. |
| Mews | Raised $300M at $2.5B (Jan 2026). 12,500 properties. Largest-ever hotel PMS round. |
| Guesty | Short-term rental PMS. Multi-channel (Airbnb, VRBO, Booking.com). Raised $170M. |
| Apaleo | API-first PMS. First to launch AI agent marketplace. €20M raised. Modular approach. |
| StayNTouch | Mobile-first PMS. AWS-hosted. 100% uptime focus. Contactless check-in. |

## Data Source

- **Backend:** `backend/fetch_prices.py` → `TICKERS`, `SECTORS["hotel"]`
- **Frontend:** `frontend/src/sectors.js` → `companies` array in Hotel PMS sector
