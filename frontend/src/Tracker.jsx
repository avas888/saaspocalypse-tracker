import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { SECTORS } from "./sectors.js";

const SECTOR_ORDER = ["crm", "project", "document", "payroll", "accounting", "ecommerce", "pos", "hotel"];
const SECTOR_META = {};
SECTORS.forEach(s => { SECTOR_META[s.id] = { name: s.name, icon: s.icon, color: s.color }; });

// Sector → tickers (matches backend fetch_prices.py for sector averages)
const SECTOR_TICKERS = {
  crm: ["HUBS", "MNDY", "CRM", "FRSH"],
  project: ["ASAN", "SMAR", "MNDY"],
  accounting: ["INTU", "XRO.AX", "SGE.L", "TOTS3.SA", "4478.T"],
  payroll: ["ADP", "PAYX", "PAYC", "PCTY", "XYZ"],
  pos: ["TOST", "XYZ", "LSPD", "FI", "DASH"],
  hotel: ["AGYS"],
  document: ["DOCU", "DBX"],
  ecommerce: ["SHOP", "BIGC", "WIX", "SQSP", "VTEX"],
};

/**
 * Build baseline prices: { ticker: base_price }
 * Uses baseline.json if available, else derives from first day's prev_close (price before SaaSpocalypse).
 */
function buildBaseline(baselineData, firstDaySnapshot) {
  if (baselineData?.tickers) {
    const out = {};
    for (const [ticker, t] of Object.entries(baselineData.tickers)) {
      if (t.price != null) out[ticker] = t.price;
    }
    return out;
  }
  if (firstDaySnapshot?.tickers) {
    const out = {};
    for (const [ticker, t] of Object.entries(firstDaySnapshot.tickers)) {
      const base = t.prev_close ?? t.close;
      if (base != null) out[ticker] = base;
    }
    return out;
  }
  return {};
}

/**
 * Consolidation logic:
 * - Days 1-7: show as individual day columns (Mon, Tue, etc.)
 * - On day 8: days 1-7 collapse into "Wk 1" (cumulative), new daily columns start
 * - After 4 weeks: weeks 1-4 collapse into "Mo 1" (cumulative), new week columns start
 * - Continues: weeks consolidate to months
 * - Each cell shows cumulative % change from SaaSpocalypse base date to end of that period
 */
const BASE_DATE = "2026-02-03";

function consolidateTimeline(dailyData, baseline) {
  if (!dailyData.length) return { columns: [], rows: {} };

  // Sort by date ascending
  const sorted = [...dailyData].sort((a, b) => a.date.localeCompare(b.date));

  // Keep only data points every 2 days after Feb 3 (Feb 5, 7, 9, 11, ...)
  // Feb 3 is shown separately as "Feb 3 (zero)" pre-point, so exclude it here
  const baseMs = new Date(BASE_DATE + "T12:00:00").getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const sampled = sorted.filter(s => {
    const d = new Date(s.date + "T12:00:00").getTime();
    const daysSinceBase = Math.round((d - baseMs) / dayMs);
    return daysSinceBase > 0 && daysSinceBase % 2 === 0;
  });

  const columns = []; // { id, label, sublabel, type: 'day'|'week'|'month', dates: [...] }
  let dayBuffer = [];
  let weekBuffer = [];
  let weekCount = 0;
  let monthCount = 0;

  for (let i = 0; i < sampled.length; i++) {
    dayBuffer.push(sampled[i]);

    // When we have 7 days, consolidate into a week
    if (dayBuffer.length === 7) {
      weekCount++;
      const startDate = dayBuffer[0].date;
      const endDate = dayBuffer[6].date;
      const weekCol = {
        id: `wk-${weekCount}`,
        label: `Wk ${weekCount}`,
        sublabel: `${fmtShort(startDate)}–${fmtShort(endDate)}`,
        type: "week",
        dates: dayBuffer.map(d => d.date),
        data: dayBuffer,
      };
      weekBuffer.push(weekCol);
      dayBuffer = [];

      // When we have 4 weeks, consolidate into a month
      if (weekBuffer.length === 4) {
        monthCount++;
        const monthCol = {
          id: `mo-${monthCount}`,
          label: `Mo ${monthCount}`,
          sublabel: `${weekBuffer[0].sublabel.split("–")[0]}–${weekBuffer[3].sublabel.split("–")[1]}`,
          type: "month",
          dates: weekBuffer.flatMap(w => w.dates),
          data: weekBuffer.flatMap(w => w.data),
        };
        columns.push(monthCol);
        weekBuffer = [];
      }
    }
  }

  // Push remaining complete weeks
  weekBuffer.forEach(w => columns.push(w));

  // Push remaining days individually
  dayBuffer.forEach(d => {
    const dayName = new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
    columns.push({
      id: `day-${d.date}`,
      label: dayName,
      sublabel: fmtShort(d.date),
      type: "day",
      dates: [d.date],
      data: [d],
    });
  });

  // Build rows: for each sector, cumulative % from base date to end of each column
  // Also compute variability (std dev of ticker pcts) per sector for the last column
  const rows = {};
  const variability = {};

  function stdDev(pcts) {
    if (pcts.length < 2) return null;
    const mean = pcts.reduce((a, b) => a + b, 0) / pcts.length;
    const variance = pcts.reduce((sum, x) => sum + (x - mean) ** 2, 0) / pcts.length;
    return Math.sqrt(variance);
  }

  SECTOR_ORDER.forEach(sectorId => {
    const tickers = SECTOR_TICKERS[sectorId] || [];
    rows[sectorId] = columns.map((col, colIdx) => {
      const lastDay = col.data[col.data.length - 1];
      if (!lastDay?.tickers) return null;
      const pcts = [];
      for (const t of tickers) {
        const base = baseline[t];
        const close = lastDay.tickers[t]?.close;
        if (base != null && close != null && base > 0) {
          pcts.push(((close - base) / base) * 100);
        }
      }
      if (pcts.length === 0) return null;
      const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
      if (colIdx === columns.length - 1) {
        const sd = stdDev(pcts);
        variability[sectorId] = sd != null ? Math.round(sd * 100) / 100 : null;
      }
      return Math.round(avg * 100) / 100;
    });
  });

  return { columns, rows, variability };
}

function fmtShort(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SortedTooltip({ active, payload, label, formatter, sortDesc = false }) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => {
    const va = a.value;
    const vb = b.value;
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return sortDesc ? vb - va : va - vb;
  });
  return (
    <div style={{ background: "white", padding: "8px 12px", borderRadius: 6, border: "1px solid #E7E5E4", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 11 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {sorted.map((entry) => (
        <div key={entry.dataKey} style={{ color: entry.color, margin: "2px 0" }}>
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </div>
      ))}
    </div>
  );
}

function cellColor(val) {
  if (val === null || val === undefined) return { bg: "#F5F5F4", text: "#A8A29E" };
  if (val <= -3) return { bg: "#FEE2E2", text: "#991B1B" };
  if (val <= -1) return { bg: "#FEF3C7", text: "#92400E" };
  if (val < 1) return { bg: "#F5F5F4", text: "#57534E" };
  if (val < 3) return { bg: "#D1FAE5", text: "#065F46" };
  return { bg: "#A7F3D0", text: "#064E3B" };
}

function SectorChart({ columns, rows, baselineDate, ltmHighData, sectors = SECTOR_ORDER }) {
  const zeroDate = BASE_DATE;
  const fmt = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
  const prePoints = [
    { date: "Feb 3 (zero)", sortKey: zeroDate },
    ...(baselineDate && baselineDate !== zeroDate ? [{ date: `${fmt(baselineDate)} (base)`, sortKey: baselineDate }] : []),
  ];

  const dataPoints = columns.map((col, colIdx) => {
    const lastDay = col.data?.[col.data.length - 1];
    const dateStr = lastDay?.date || col.dates?.[0];
    const point = {
      date: col.sublabel,
      label: col.label,
      sortKey: dateStr || col.sublabel,
    };
    sectors.forEach(sectorId => {
      const val = rows[sectorId]?.[colIdx];
      point[sectorId] = val != null ? val : null;
    });
    return point;
  });

  const ltmHigh = {};
  const ltmHighDates = {};
  sectors.forEach(sectorId => {
    if (ltmHighData?.sectors?.[sectorId]?.ltm_high_pct != null) {
      ltmHigh[sectorId] = ltmHighData.sectors[sectorId].ltm_high_pct;
      const d = ltmHighData.sectors[sectorId].high_date;
      if (d) {
        const parsed = new Date(d + "T12:00:00");
        ltmHighDates[sectorId] = parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    } else {
      const values = [0, ...dataPoints.map(p => p[sectorId]).filter(v => v != null)];
      ltmHigh[sectorId] = values.length > 0 ? Math.round(Math.max(...values) * 100) / 100 : null;
    }
  });

  const chartData = [
    ...prePoints.map(p => {
      const pt = { date: p.date, sortKey: p.sortKey };
      sectors.forEach(sectorId => { pt[sectorId] = 0; });
      return pt;
    }),
    ...dataPoints,
    {
      date: "LTM High",
      sortKey: "2026-02-01",
      ...ltmHigh,
    },
  ].sort((a, b) => (a.sortKey || "").localeCompare(b.sortKey || ""));

  if (chartData.length === 0) return null;

  const base100Data = chartData.map(p => {
    const out = { date: p.date, sortKey: p.sortKey };
    sectors.forEach(sectorId => {
      const raw = p[sectorId];
      const high = ltmHigh[sectorId];
      if (raw == null || high == null) {
        out[sectorId] = null;
      } else {
        const denom = 1 + high / 100;
        out[sectorId] = Math.round(100 * (1 + raw / 100) / denom * 100) / 100;
      }
    });
    return out;
  });

  const base100Values = base100Data.flatMap(p => sectors.map(s => p[s]).filter(v => v != null));
  const base100Min = base100Values.length ? Math.min(...base100Values) : 60;
  const base100Max = base100Values.length ? Math.max(...base100Values) : 105;
  const base100Domain = [Math.max(base100Min - 5, 50), Math.min(base100Max + 5, 110)];

  const postCrashData = chartData.filter(p => (p.sortKey || "") >= zeroDate);
  const postCrashValues = postCrashData.flatMap(p => sectors.map(s => p[s]).filter(v => v != null));
  const postCrashMin = postCrashValues.length ? Math.min(...postCrashValues) : -10;
  const postCrashMax = postCrashValues.length ? Math.max(...postCrashValues) : 0;
  const postCrashRange = Math.max(postCrashMax - postCrashMin, 0.5);
  const zoomPadding = Math.max(postCrashRange * 0.15, 0.3);
  const zoomDomain = [
    postCrashMin - zoomPadding,
    postCrashMax + zoomPadding,
  ];

  return (
    <div style={{ marginTop: 20, borderRadius: 8, border: "1px solid #E7E5E4", padding: 16, background: "#FAFAF9" }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#78716C", marginBottom: 12 }}>
        Cumulative % by sector over time
      </div>
      <div style={{ fontSize: 9, color: "#A8A29E", marginBottom: 8 }}>
        Base 100 = LTM High. Date labels show peak timing per sector (dates differ).
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={base100Data} margin={{ top: 5, right: 30, left: 45, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#78716C" }} />
          <YAxis tick={{ fontSize: 10, fill: "#78716C" }} domain={base100Domain} />
          <ReferenceLine y={100} stroke="#78716C" strokeWidth={1.5} strokeDasharray="4 4" />
          <Tooltip
            content={<SortedTooltip formatter={(v) => (v != null ? v.toFixed(1) : "—")} />}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {sectors.map(sectorId => {
            const meta = SECTOR_META[sectorId];
            const peakDate = ltmHighDates[sectorId];
            return (
              <Line
                key={sectorId}
                type="monotone"
                dataKey={sectorId}
                name={meta.name}
                stroke={meta.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
                label={(props) => {
                  if (props.payload?.date !== "LTM High" || !peakDate) return null;
                  const x = props.x ?? 0;
                  const y = props.y ?? 0;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={6} y={-4} fontSize={8} fill={meta.color} fontWeight={600}>
                        {peakDate}
                      </text>
                    </g>
                  );
                }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      {postCrashData.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#78716C", marginBottom: 8 }}>
            Zoomed: Post-crash (Feb 3 onward) — slope comparison
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={postCrashData} margin={{ top: 5, right: 30, left: 45, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#78716C" }} />
              <YAxis tickFormatter={v => `${Number(v).toFixed(2)}%`} tick={{ fontSize: 10, fill: "#78716C" }} domain={zoomDomain} />
              <ReferenceLine y={0} stroke="#78716C" strokeWidth={1.5} strokeDasharray="4 4" />
              <Tooltip
                content={<SortedTooltip formatter={(v) => (v != null ? `${v > 0 ? "+" : ""}${Number(v).toFixed(2)}%` : "—")} />}
              />
              {sectors.map(sectorId => {
                const meta = SECTOR_META[sectorId];
                return (
                  <Line
                    key={sectorId}
                    type="monotone"
                    dataKey={sectorId}
                    name={meta.name}
                    stroke={meta.color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #E7E5E4" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#78716C", marginBottom: 8 }}>
          LTM High (Last Twelve Months)
        </div>
        <div style={{ fontSize: 8, color: "#A8A29E", marginBottom: 6 }}>
          Peak % above Feb 3 baseline. Run <code style={{ fontSize: 8 }}>npm run fetch:ltm</code> for real data.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px" }}>
          {sectors.map(sectorId => {
            const meta = SECTOR_META[sectorId];
            const val = ltmHigh[sectorId];
            const peakDate = ltmHighDates[sectorId];
            const c = cellColor(val);
            return (
              <span key={sectorId} style={{
                fontSize: 10, padding: "2px 6px", borderRadius: 3,
                background: c.bg, color: c.text, fontWeight: 600,
              }}>
                {meta.icon} {meta.name}: {val != null ? `${val > 0 ? "+" : ""}${val.toFixed(1)}%` : "—"}
                {peakDate && <span style={{ opacity: 0.85, marginLeft: 4 }}>({peakDate})</span>}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatBaseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Tracker() {
  const [dailyData, setDailyData] = useState([]);
  const [baseline, setBaseline] = useState(null);
  const [baselineDate, setBaselineDate] = useState(null);
  const [ltmHighData, setLtmHighData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSector, setExpandedSector] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(new Set()); // empty = all, non-empty = only those sectors

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const listRes = await fetch("/api/data/");
      const list = await listRes.json();

      const dailyFiles = list.files.filter(f => f !== "baseline.json" && f !== "ltm_high.json");

      const [baselineData, ltmHighData, ...snapshots] = await Promise.all([
        fetch("/api/data/baseline.json").then(r => r.ok ? r.json() : null).catch(() => null),
        fetch("/api/data/ltm_high.json").then(r => r.ok ? r.json() : null).catch(() => null),
        ...dailyFiles.map(f => fetch(`/api/data/${f}`).then(r => r.json())),
      ]);

      const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
      const firstDay = sorted[0] || null;
      const base = buildBaseline(baselineData, firstDay);
      setBaseline(base);
      setDailyData(snapshots);
      setLtmHighData(ltmHighData);
      if (baselineData?.date) {
        setBaselineDate(baselineData.date);
      } else if (firstDay?.date) {
        const prev = new Date(firstDay.date + "T12:00:00");
        prev.setDate(prev.getDate() - 1);
        setBaselineDate(prev.toISOString().slice(0, 10));
      } else {
        setBaselineDate(null);
      }
      setLoading(false);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#78716C" }}>
        <div style={{ fontSize: 13 }}>Loading price data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#991B1B", marginBottom: 4 }}>Error loading data</div>
        <div style={{ fontSize: 11, color: "#7F1D1D" }}>{error}</div>
        <div style={{ fontSize: 11, color: "#78716C", marginTop: 8 }}>
          Run <code style={{ background: "#F5F5F4", padding: "1px 4px", borderRadius: 3 }}>npm run fetch:backfill</code> to fetch price data.
        </div>
      </div>
    );
  }

  if (!dailyData.length) {
    return (
      <div style={{ padding: 20, background: "#FFFBEB", borderRadius: 8, border: "1px solid #FDE68A" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", marginBottom: 4 }}>No price data yet</div>
        <div style={{ fontSize: 11, color: "#78716C", lineHeight: 1.6 }}>
          Run these commands to start tracking:<br />
          <code style={{ background: "#F5F5F4", padding: "1px 4px", borderRadius: 3 }}>npm run fetch:backfill</code> — backfill from Feb 3<br />
          <code style={{ background: "#F5F5F4", padding: "1px 4px", borderRadius: 3 }}>npm run fetch</code> — fetch today's prices
        </div>
      </div>
    );
  }

  const { columns, rows, variability } = consolidateTimeline(dailyData, baseline || {});

  const baseDateFormatted = formatBaseDate(baselineDate);

  // Order sectors by absolute cumulative change (highest at top, lowest at bottom)
  const sectorOrderRaw = [...SECTOR_ORDER].sort((a, b) => {
    const dataA = rows[a] || [];
    const dataB = rows[b] || [];
    const cumA = dataA.length ? dataA[dataA.length - 1] : null;
    const cumB = dataB.length ? dataB[dataB.length - 1] : null;
    const absA = cumA != null ? Math.abs(cumA) : 0;
    const absB = cumB != null ? Math.abs(cumB) : 0;
    return absB - absA;
  });

  const sectorOrder = categoryFilter.size === 0
    ? sectorOrderRaw
    : sectorOrderRaw.filter(s => categoryFilter.has(s));

  function toggleCategory(sectorId) {
    if (sectorId === null) {
      setCategoryFilter(new Set());
      return;
    }
    setCategoryFilter(prev => {
      const next = new Set(prev);
      if (next.has(sectorId)) next.delete(sectorId);
      else next.add(sectorId);
      return next;
    });
  }

  const isAllActive = categoryFilter.size === 0;

  return (
    <div>
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#78716C" }}>
              Cumulative Tracker
            </span>
            {baseDateFormatted && (
              <span style={{
                fontSize: 9, padding: "2px 8px", borderRadius: 4, fontWeight: 700,
                background: "#EDE9FE", color: "#6D28D9", fontFamily: "monospace",
              }}>
                Base: {baseDateFormatted}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#A8A29E", marginTop: 2 }}>
            % change since SaaSpocalypse base date · {dailyData.length} trading days · auto-consolidates: days → weeks → months
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#78716C", letterSpacing: "0.06em", textTransform: "uppercase" }}>Filter:</span>
          <button
            onClick={() => toggleCategory(null)}
            style={{
              fontSize: 9, padding: "4px 8px", borderRadius: 4, fontWeight: 700,
              background: isAllActive ? "#1C1917" : "#F5F5F4",
              color: isAllActive ? "white" : "#57534E",
              border: "none", cursor: "pointer", fontFamily: "monospace",
            }}
          >
            All
          </button>
          {SECTOR_ORDER.map(sectorId => {
            const meta = SECTOR_META[sectorId];
            const active = categoryFilter.has(sectorId);
            return (
              <button
                key={sectorId}
                onClick={() => toggleCategory(sectorId)}
                style={{
                  fontSize: 9, padding: "4px 8px", borderRadius: 4, fontWeight: 700,
                  background: active ? meta.color : "#F5F5F4",
                  color: active ? "white" : "#57534E",
                  border: "none", cursor: "pointer",
                }}
              >
                {meta.icon} {meta.name}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Day", type: "day" },
            { label: "Week", type: "week" },
            { label: "Month", type: "month" },
          ].map(t => {
            const count = columns.filter(c => c.type === t.type).length;
            return count > 0 ? (
              <span key={t.type} style={{
                fontSize: 9, padding: "2px 6px", borderRadius: 3,
                background: t.type === "month" ? "#EDE9FE" : t.type === "week" ? "#DBEAFE" : "#F5F5F4",
                color: t.type === "month" ? "#6D28D9" : t.type === "week" ? "#1E40AF" : "#57534E",
                fontWeight: 700, fontFamily: "monospace",
              }}>
                {count} {t.label}{count > 1 ? "s" : ""}
              </span>
            ) : null;
          })}
        </div>
      </div>

      {/* Scrollable table */}
      <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #E7E5E4" }}>
        <table style={{
          borderCollapse: "collapse", width: "100%", fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, minWidth: columns.length * 70 + 320,
        }}>
          <thead>
            {/* Column type indicator row */}
            <tr>
              <th style={{ padding: "4px 10px", background: "#FAFAF9", borderBottom: "1px solid #E7E5E4", position: "sticky", left: 0, zIndex: 2 }} />
              {columns.map(col => (
                <th key={col.id} style={{
                  padding: "2px 4px", textAlign: "center", borderBottom: "none",
                  background: col.type === "month" ? "#EDE9FE" : col.type === "week" ? "#DBEAFE" : "#FAFAF9",
                  fontSize: 7, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: col.type === "month" ? "#6D28D9" : col.type === "week" ? "#1E40AF" : "#A8A29E",
                }}>
                  {col.type}
                </th>
              ))}
              <th style={{ padding: "2px 4px", textAlign: "center", borderBottom: "none", background: "#FAFAF9", fontSize: 7, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A8A29E" }}>
                Δ
              </th>
              <th style={{ padding: "2px 4px", textAlign: "center", borderBottom: "none", background: "#FAFAF9", fontSize: 7, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A8A29E" }}>
                Var
              </th>
            </tr>
            {/* Column label row */}
            <tr>
              <th style={{
                padding: "6px 10px", textAlign: "left", background: "#FAFAF9",
                borderBottom: "2px solid #D6D3D1", fontSize: 10, fontWeight: 800,
                position: "sticky", left: 0, zIndex: 2,
              }}>
                Sector
              </th>
              {columns.map(col => (
                <th key={col.id} style={{
                  padding: "4px 6px", textAlign: "center",
                  background: col.type === "month" ? "#F5F3FF" : col.type === "week" ? "#EFF6FF" : "#FAFAF9",
                  borderBottom: "2px solid #D6D3D1", whiteSpace: "nowrap",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>{col.label}</div>
                  <div style={{ fontSize: 8, color: "#A8A29E", fontWeight: 400 }}>{col.sublabel}</div>
                </th>
              ))}
              <th style={{ padding: "4px 8px", textAlign: "center", background: "#FAFAF9", borderBottom: "2px solid #D6D3D1", whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 10, fontWeight: 800 }}>Δ since Feb 3</div>
                <div style={{ fontSize: 8, color: "#A8A29E", fontWeight: 400 }}>Cumulative</div>
              </th>
              <th style={{ padding: "4px 8px", textAlign: "center", background: "#FAFAF9", borderBottom: "2px solid #D6D3D1", fontSize: 9, fontWeight: 700, color: "#78716C" }}>
                Variability
              </th>
            </tr>
          </thead>
          <tbody>
            {sectorOrder.map((sectorId, si) => {
              const meta = SECTOR_META[sectorId];
              const isExpanded = expandedSector === sectorId;
              const sectorData = rows[sectorId] || [];

              // Find tickers for this sector
              const sectorDef = SECTORS.find(s => s.id === sectorId);
              const publicTickers = sectorDef?.companies.filter(c => c.status === "public") || [];

              return (
                <React.Fragment key={sectorId}>
                  {/* Sector row */}
                  <tr
                    onClick={() => setExpandedSector(isExpanded ? null : sectorId)}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{
                      padding: "8px 10px", fontWeight: 700, background: "white",
                      borderBottom: isExpanded ? "none" : "1px solid #F5F5F4",
                      position: "sticky", left: 0, zIndex: 1, whiteSpace: "nowrap",
                      fontFamily: "'Newsreader', Georgia, serif", fontSize: 12,
                    }}>
                      <span style={{ marginRight: 4 }}>{meta.icon}</span>
                      {meta.name}
                      <span style={{ color: "#D6D3D1", marginLeft: 4, fontSize: 10 }}>{isExpanded ? "▼" : "▶"}</span>
                    </td>
                    {sectorData.map((val, ci) => {
                      const c = cellColor(val);
                      return (
                        <td key={ci} style={{
                          padding: "6px 8px", textAlign: "center",
                          background: c.bg, color: c.text, fontWeight: 700,
                          borderBottom: isExpanded ? "none" : "1px solid #F5F5F4",
                          borderLeft: columns[ci]?.type !== "day" ? `2px solid ${columns[ci]?.type === "month" ? "#C4B5FD" : "#93C5FD"}` : "1px solid #F5F5F4",
                        }}>
                          {val !== null ? `${val > 0 ? "+" : ""}${val.toFixed(1)}%` : "—"}
                        </td>
                      );
                    })}
                    {(() => {
                      const cumVal = sectorData.length ? sectorData[sectorData.length - 1] : null;
                      const c = cumVal != null ? cellColor(cumVal) : { bg: "#FAFAF9", text: "#78716C" };
                      return (
                        <td key="cum" style={{
                          padding: "6px 8px", textAlign: "center",
                          background: c.bg, color: c.text, fontWeight: 700,
                          borderBottom: isExpanded ? "none" : "1px solid #F5F5F4",
                          borderLeft: "2px solid #E7E5E4",
                        }}>
                          {cumVal != null ? `${cumVal > 0 ? "+" : ""}${cumVal.toFixed(1)}%` : "—"}
                        </td>
                      );
                    })()}
                    <td style={{
                      padding: "6px 8px", textAlign: "center", fontSize: 10,
                      background: "#FAFAF9", color: "#78716C", fontWeight: 600,
                      borderBottom: isExpanded ? "none" : "1px solid #F5F5F4",
                    }} title={variability[sectorId] == null && (SECTOR_TICKERS[sectorId]?.length ?? 0) < 2 ? "N/A — needs ≥2 tickers for std dev" : undefined}>
                      {variability[sectorId] != null ? `±${variability[sectorId].toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                  {/* Expanded: individual company rows */}
                  {isExpanded && publicTickers.map(company => (
                    <CompanyRow
                      key={company.ticker}
                      company={company}
                      columns={columns}
                      baseline={baseline || {}}
                    />
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Line chart */}
      <SectorChart columns={columns} rows={rows} baselineDate={baselineDate} ltmHighData={ltmHighData} sectors={sectorOrder} />

      {/* Legend */}
      <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, color: "#A8A29E", fontWeight: 700 }}>SCALE:</span>
        {[
          { label: "≤-3%", ...cellColor(-4) },
          { label: "-1 to -3%", ...cellColor(-2) },
          { label: "-1 to +1%", ...cellColor(0) },
          { label: "+1 to +3%", ...cellColor(2) },
          { label: "≥+3%", ...cellColor(4) },
        ].map(s => (
          <span key={s.label} style={{
            fontSize: 9, padding: "2px 6px", borderRadius: 3,
            background: s.bg, color: s.text, fontWeight: 600,
          }}>{s.label}</span>
        ))}
      </div>
    </div>
  );
}

// Individual company row within expanded sector — cumulative % from base date
function CompanyRow({ company, columns, baseline }) {
  const base = baseline[company.ticker];
  const vals = columns.map(col => {
    const lastDay = col.data[col.data.length - 1];
    const close = lastDay?.tickers?.[company.ticker]?.close;
    if (base == null || close == null || base <= 0) return null;
    return Math.round(((close - base) / base) * 10000) / 100;
  });

  return (
    <tr>
      <td style={{
        padding: "4px 10px 4px 28px", fontSize: 10, color: "#78716C",
        background: "#FAFAF9", borderBottom: "1px solid #F5F5F4",
        position: "sticky", left: 0, zIndex: 1, whiteSpace: "nowrap",
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {company.name} <span style={{ color: "#A8A29E" }}>{company.ticker}</span>
      </td>
      {vals.map((val, ci) => {
        const c = cellColor(val);
        return (
          <td key={ci} style={{
            padding: "4px 6px", textAlign: "center", fontSize: 10,
            background: c.bg, color: c.text, fontWeight: 600,
            borderBottom: "1px solid #F5F5F4",
            borderLeft: columns[ci]?.type !== "day" ? `2px solid ${columns[ci]?.type === "month" ? "#C4B5FD" : "#93C5FD"}` : "1px solid #F5F5F4",
          }}>
            {val !== null ? `${val > 0 ? "+" : ""}${val.toFixed(1)}%` : "—"}
          </td>
        );
      })}
      {(() => {
        const cumVal = vals.length ? vals[vals.length - 1] : null;
        const c = cumVal != null ? cellColor(cumVal) : { bg: "#FAFAF9", text: "#A8A29E" };
        return (
          <td key="cum" style={{
            padding: "4px 8px", textAlign: "center", fontSize: 10,
            background: c.bg, color: c.text, fontWeight: 600,
            borderBottom: "1px solid #F5F5F4",
            borderLeft: "2px solid #E7E5E4",
          }}>
            {cumVal != null ? `${cumVal > 0 ? "+" : ""}${cumVal.toFixed(1)}%` : "—"}
          </td>
        );
      })()}
      <td style={{ padding: "4px 8px", textAlign: "center", fontSize: 10, color: "#A8A29E", background: "#FAFAF9", borderBottom: "1px solid #F5F5F4" }}>—</td>
    </tr>
  );
}

