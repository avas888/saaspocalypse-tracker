# Troubleshooting

## npm run fetch

**Symptom:** `ValueError: FMP API Key is missing`  
**Fix:** Create `.env` in project root with `FMP_API_KEY=your_key`. Copy from `.env.example`.

**Symptom:** `ModuleNotFoundError: No module named 'requests'` or `'dotenv'`  
**Fix:** `pip3 install -r requirements.txt`

**Symptom:** "Data already exists for 2026-02-11. Use --force to overwrite."  
**Fix:** Expected. Use `npm run fetch:force` to overwrite.

**Symptom:** `403 Forbidden` or `429 Rate Limit Exceeded`  
**Fix:** Check API key validity; free plan has ~250 calls/day. Spread backfill over multiple runs if needed.

## International tickers

**Note:** When FMP has no data (402, empty) for tickers like XRO.AX, SGE.L, TOTS3.SA, 4478.T, the fetcher automatically falls back to Yahoo Finance. You'll see `📡 ticker: yf fallback (FMP unavailable)` in the output.

## Tracker tab

**Symptom:** "No price data yet"  
**Fix:** `npm run fetch:backfill`

**Symptom:** Loading forever  
**Fix:** Ensure `npm run dev` is running. Create `data/` if missing: `mkdir -p data`

## Stale data after git pull

If someone added tickers/sectors, existing JSON files won't include them.

**Options:**
1. `rm data/2026-02-*.json && npm run fetch:backfill`
2. Accept partial data — frontend handles missing tickers gracefully.

---

## Known Limitations

1. **FMP free tier.** ~250 API calls/day. When FMP has no data (402, empty, or missing tickers), the fetcher falls back to Yahoo Finance automatically.

2. **No weekends/holidays handling.** Consolidation counts 7 *trading days* as a week, not calendar days. "Wk 1" may span ~9 calendar days.

3. **Block (XYZ) dual-listing.** Block appears in Payroll and POS sectors; both sector averages include it.

4. **Consolidation is trading-day based.** "Mo 1" may span 5–6 calendar weeks.

5. **No real-time intraday data.** End-of-day closing prices only.

6. **Seed data is approximate.** Run `npm run fetch:backfill` to replace with real data.
