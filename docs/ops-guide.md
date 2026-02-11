# SaaSpocalypse Tracker — Operations & Deployment Guide

**Version:** 1.0.0  
**Last updated:** February 11, 2026  
**Audience:** Engineering / DevOps team responsible for maintaining and extending the tracker

---

## 1. Initial Setup

### 1.1 Install dependencies

```bash
npm install
pip install -r requirements.txt
# or: pip3 install -r requirements.txt
```

### 1.2 Configure FMP API key

Create a `.env` file in the project root:

```bash
cp .env.example .env
# Edit .env and add: FMP_API_KEY=your_key_here
```

Get an API key at [financialmodelingprep.com](https://financialmodelingprep.com/). Free plan allows ~250 calls/day.

### 1.3 Backfill historical price data

Fetches all trading-day closing prices from **February 3, 2026** through today via the FMP API. Creates `baseline.json` and one `YYYY-MM-DD.json` per trading day.

```bash
npm run fetch:backfill
```

**Expected runtime:** 1–3 minutes (FMP historical API: ~28 calls for baseline + backfill).

### 1.4 Start the development server

```bash
npm run dev
```

Opens at **http://localhost:5173**.

---

## 2. Daily Operations

### 2.1 Fetch today's prices

Run **after US market close** (4:00 PM ET).

```bash
npm run fetch
```

Idempotent — skips if today's file already exists.

**Force re-fetch:**

```bash
npm run fetch:force
```

### 2.2 Automating with cron (macOS)

```bash
crontab -e
```

Add (adjust path):

```cron
0 17 * * 1-5 cd /path/to/saaspocalypse-tracker && npm run fetch >> /tmp/saaspocalypse-fetch.log 2>&1
```

### 2.3 Alternative: launchd (macOS)

Create `~/Library/LaunchAgents/com.saaspocalypse.fetch.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.saaspocalypse.fetch</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/npm</string>
        <string>run</string>
        <string>fetch</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/path/to/saaspocalypse-tracker</string>
    <key>StartCalendarInterval</key>
    <array>
        <dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>17</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Weekday</key><integer>2</integer><key>Hour</key><integer>17</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Weekday</key><integer>3</integer><key>Hour</key><integer>17</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Weekday</key><integer>4</integer><key>Hour</key><integer>17</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Weekday</key><integer>5</integer><key>Hour</key><integer>17</integer><key>Minute</key><integer>0</integer></dict>
    </array>
    <key>StandardOutPath</key>
    <string>/tmp/saaspocalypse-fetch.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/saaspocalypse-fetch.log</string>
</dict>
</plist>
```

Then: `launchctl load ~/Library/LaunchAgents/com.saaspocalypse.fetch.plist`

---

## 3. Tracker Tab: Auto-Consolidation Logic

| Trading days | Display |
|--------------|---------|
| 1–6 | Individual day columns (Mon, Tue, …) |
| 7 | Days 1–7 → `Wk 1` (cumulative %). New daily columns start. |
| 8–13 | `Wk 1` + individual days |
| 14 | `Wk 1`, `Wk 2`. New daily columns start. |
| 28 | Weeks 1–4 → `Mo 1`. New weekly columns start. |
| 28+ | `Mo 1` + weeks + days |

**Cumulative %:** Compound return: `(1 + day1%) × (1 + day2%) × ... - 1`

**Sector averages:** Arithmetic mean of tickers in sector, computed in `fetch_prices.py`.

---

## 4. Tracked Tickers

28 public tickers across 8 sectors. See [data-format.md](data-format.md) for the full table. For sector-level rationale and companies per category (including private), see [concepts/README.md](concepts/README.md).

---

## 5. CLI Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install Node.js dependencies |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run fetch` | Fetch today's closing prices |
| `npm run fetch:force` | Force re-fetch today |
| `npm run fetch:backfill` | Backfill from Feb 3 to today |
| `npm run fetch:ltm` | Fetch LTM high % data |
