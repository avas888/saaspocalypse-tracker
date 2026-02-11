# Railway CLI Troubleshooting

Use these commands to troubleshoot the SaaSpocalypse Tracker deployment when new companies (e.g. SABR, SDR.AX) don't appear.

## 1. Link a service (required for most commands)

The project must be linked to a service. Run in your terminal (interactive):

```bash
cd /path/to/saaspocalypse-tracker
railway link
```

Select: **saaspocalypse-tracker** project → **production** environment → your web service.

Or link non-interactively if you know the service name:

```bash
railway link -p saaspocalypse-tracker -e production -s <SERVICE_NAME>
```

## 2. Check status

```bash
railway status
```

Shows linked project, environment, and service.

## 3. List volumes (stale data cause)

```bash
railway volume list
```

If volumes exist, they may be serving old data. **No volumes** = data comes from the Docker image (correct).

## 4. Force a clean redeploy

```bash
railway redeploy
```

Redeploys the latest build. To force a **fresh build** (clears cache), push a new commit or use:

```bash
railway up
```

This uploads and deploys from the current directory.

## 5. View logs

```bash
railway logs
```

Check for startup errors or data-load issues.

## 6. Inspect deployed data via API

Get your deployment URL from `railway domain` or the dashboard, then:

```bash
curl https://YOUR-APP.railway.app/api/data/2026-02-11.json | grep -E "SABR|SDR"
```

- **SABR/SDR appear** → API data is correct; issue is likely frontend cache.
- **SABR/SDR missing** → Data is stale (volume or old image).

## 7. Open dashboard

```bash
railway open
```

Opens the Railway dashboard to check volumes, build settings, and redeploy with cache clear.

## Quick fix summary

1. `railway link` (select your service)
2. `railway volume list` — if volumes exist at `/app/data`, remove them in the dashboard
3. `railway redeploy` or push a new commit to trigger a fresh deploy
