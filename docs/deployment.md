# Railway Deployment

When you're ready to deploy, the app needs a thin production server layer. The architecture is already deployment-friendly.

## Guardrails: code + data always fresh on deploy

| Guardrail | Purpose |
|-----------|---------|
| **Dockerfile cache bust** | `ARG RAILWAY_GIT_COMMIT_SHA` invalidates layers when commit changes |
| **No volume at /app/data** | Data comes from image; volume would serve stale data |
| **GitHub Action** | `.github/workflows/refresh-data-and-deploy.yml` refreshes data on push + schedule |
| **railway.json** | Ensures Dockerfile build |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Railway service (single Node + Python container)   │
├─────────────────────────────────────────────────────┤
│  Express server                                     │
│  ├── Serves static files from dist/                │
│  ├── Serves /api/data from data/ (baked in image)  │
│  └── NO volume — data from repo                    │
└─────────────────────────────────────────────────────┘
```

## Checklist

| Step | What |
|------|------|
| 1 | Add `server.js` (Express: static + `/api/data`) |
| 2 | Add Dockerfile (Node + Python, build, run) |
| 3 | **Do NOT** mount a volume at `/app/data` |
| 4 | Add `FMP_API_KEY` as GitHub repo secret (for Actions) |

## One-time setup: FMP_API_KEY + remove volume

### 1. Add FMP_API_KEY (GitHub)

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** → Name: `FMP_API_KEY`, Value: your [FMP API key](https://financialmodelingprep.com/)

Optional; the fetcher uses yfinance when FMP has no data or no key.

### 2. Remove volume at /app/data (Railway)

1. Railway dashboard → **saaspocalypse-tracker** project → **Variables**
2. Check **Volumes** tab — if a volume is mounted at `/app/data`, **remove it**
3. Redeploy so data comes from the image (repo)

## Files to Add

| File | Role |
|------|------|
| `server.js` | Express: serve `dist/` and `/api/data` |
| `Dockerfile` | Node + Python, build + run |
| `requirements.txt` | `requests`, `python-dotenv` (FMP client deps) |

## Environment

- `PORT` — Railway sets this; server uses `process.env.PORT || 3000`
- `DATA_DIR` — Optional override for data path (default: `./data`)
- `FMP_API_KEY` — Required for `fetch_prices.py`; set in env or `.env`

## Volume

**Important:** If you commit `data/*.json` to git (default), do **not** mount a volume at `/app/data`. A volume overlays the directory and will serve stale data from the first deploy, hiding new tickers and updated prices.

- **Data in git:** Skip the volume. Each deploy uses fresh data from the image.
- **Ephemeral data:** No volume = data comes from the image; redeploys get latest.
- **Daily fetch:** If you run `fetch_prices.py` via cron and want to persist new data, mount a volume and run the fetcher after deploy to populate it.

### Troubleshooting: New companies not showing after deploy

If you added tickers (e.g. SABR, SDR.AX) but they don’t appear:

1. **Remove the volume** at `/app/data` in Railway (or similar) so the app uses the data baked into the image.
2. **Clear build cache** and redeploy so the frontend bundle includes the new companies from `sectors.js`.
3. **Redeploy** so the latest commit is built and deployed.

## GitHub Action: refresh-data-and-deploy

The workflow runs on:
- **Push to main** — refreshes data, commits if changed, pushes (triggers deploy)
- **Schedule** — 6pm ET weekdays (after market close)
- **Manual** — `workflow_dispatch`

Add `FMP_API_KEY` as a repo secret for best results. Without it, the fetcher uses yfinance only.

## Optional: Daily Fetch (in-container)

Run `fetch_prices.py` via `node-cron` inside the same process. Railway cron services use separate containers and cannot share the volume, so in-process cron is the recommended approach.
