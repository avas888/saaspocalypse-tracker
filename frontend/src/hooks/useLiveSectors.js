/**
 * useLiveSectors — merges live market data (ltm_high + baseline + latest daily) into SECTORS.
 * Two drop columns: (1) from LTM high to baseline, (2) from Feb 3 baseline to current.
 * Falls back to static sectors.js when API data unavailable.
 */
import { useState, useEffect } from "react";
import { SECTORS } from "../sectors.js";

/** Drop % from LTM high to baseline: (baseline - high) / high * 100 */
function dropFromLtmHigh(highPrice, zeroPrice) {
  if (highPrice == null || zeroPrice == null || highPrice <= 0) return null;
  return Math.round(((zeroPrice - highPrice) / highPrice) * 100);
}

/** Drop % from Feb 3 baseline to current: (current - baseline) / baseline * 100 */
function dropFromBaseline(currentPrice, baselinePrice) {
  if (currentPrice == null || baselinePrice == null || baselinePrice <= 0) return null;
  return Math.round(((currentPrice - baselinePrice) / baselinePrice) * 100);
}

export function useLiveSectors() {
  const [sectors, setSectors] = useState(SECTORS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataAsOf, setDataAsOf] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const listRes = await fetch("/api/data/");
        if (!listRes.ok) throw new Error("Failed to list data");
        const list = await listRes.json();
        const dailyFiles = (list.files || []).filter(
          (f) => f.match(/^\d{4}-\d{2}-\d{2}\.json$/) && f !== "baseline.json" && f !== "ltm_high.json"
        );
        const latestDaily = dailyFiles.sort().reverse()[0];

        const [baselineRes, ltmRes, dailyRes] = await Promise.all([
          fetch("/api/data/baseline.json"),
          fetch("/api/data/ltm_high.json"),
          latestDaily ? fetch(`/api/data/${latestDaily}`) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        const [baseline, ltmHigh, latestSnapshot] = await Promise.all([
          baselineRes?.ok ? baselineRes.json() : Promise.resolve(null),
          ltmRes?.ok ? ltmRes.json() : Promise.resolve(null),
          dailyRes?.ok ? dailyRes.json() : Promise.resolve(null),
        ]);
        if (cancelled) return;

        if (!baseline || !ltmHigh) {
          setSectors(SECTORS);
          setLoading(false);
          return;
        }

        const tickersLtm = ltmHigh?.tickers ?? {};
        const tickersBaseline = baseline?.tickers ?? {};
        const tickersCurrent = latestSnapshot?.tickers ?? {};

        const merged = SECTORS.map((sector) => {
          const publicLtmDrops = [];
          const publicBaselineDrops = [];
          const companies = sector.companies.map((c) => {
            if (c.status !== "public" || !c.ticker || c.ticker === "private") {
              return { ...c, drop: c.drop, baselineDrop: null };
            }
            const t = tickersLtm[c.ticker];
            const base = tickersBaseline[c.ticker];
            const curr = tickersCurrent[c.ticker];
            const zeroPrice = base?.price ?? t?.zero_price;
            const highPrice = t?.high_price;
            const currentPrice = curr?.close;
            const ltmDrop = dropFromLtmHigh(highPrice, zeroPrice);
            const baselineDrop = dropFromBaseline(currentPrice, zeroPrice);
            if (ltmDrop != null) publicLtmDrops.push(ltmDrop);
            if (baselineDrop != null) publicBaselineDrops.push(baselineDrop);
            return {
              ...c,
              drop: ltmDrop ?? c.drop,
              baselineDrop: baselineDrop ?? null,
            };
          });

          const avgLtmDrop =
            publicLtmDrops.length > 0
              ? Math.round(publicLtmDrops.reduce((a, b) => a + b, 0) / publicLtmDrops.length)
              : sector.avgDrop;
          const avgBaselineDrop =
            publicBaselineDrops.length > 0
              ? Math.round(publicBaselineDrops.reduce((a, b) => a + b, 0) / publicBaselineDrops.length)
              : null;

          return {
            ...sector,
            companies,
            avgDrop: avgLtmDrop,
            avgBaselineDrop,
          };
        });

        setSectors(merged);
        setDataAsOf(latestSnapshot?.fetched_at ?? ltmHigh?.fetched_at ?? baseline?.fetched_at ?? null);
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setSectors(SECTORS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { sectors, loading, error, dataAsOf };
}
