# Railway Deployment

When you're ready to deploy, the app needs a thin production server layer. The architecture is already deployment-friendly.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Railway service (single Node + Python container)   │
├─────────────────────────────────────────────────────┤
│  Express server                                     │
│  ├── Serves static files from dist/                │
│  ├── Serves /api/data from data/ (volume)           │
│  └── Optional: node-cron runs fetch_prices.py      │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Volume         │  Mount at /app/data
│  (persistent)   │  JSON snapshots persist across deploys
└─────────────────┘
```

## Checklist

| Step | What |
|------|------|
| 1 | Add `server.js` (Express: static + `/api/data`) |
| 2 | Add Dockerfile (Node + Python, build, run) |
| 3 | Railway: create project, add volume at `/app/data` |
| 4 | Optional: Add `node-cron` for daily fetch |

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

Mount a Railway volume at `/app/data` so JSON files persist across redeploys. Without it, data is ephemeral.

## Optional: Daily Fetch

Run `fetch_prices.py` via `node-cron` inside the same process. Railway cron services use separate containers and cannot share the volume, so in-process cron is the recommended approach.
