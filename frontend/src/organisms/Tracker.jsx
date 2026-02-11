import React, { useState, useEffect } from "react";
import { SECTORS } from "../sectors.js";
import { CompanyRow } from "../molecules/index.js";
import SectorChart from "./SectorChart.jsx";
import { getCellColor } from "../atoms/tokens/semantic.js";
import { theme } from "../atoms/tokens/theme.js";

const SECTOR_ORDER = ["crm", "project", "document", "payroll", "accounting", "ecommerce", "pos", "hotel"];
const SECTOR_META = {};
SECTORS.forEach((s) => {
  SECTOR_META[s.id] = { name: s.name, icon: s.icon, color: s.color };
});

const SECTOR_TICKERS = {
  crm: ["HUBS", "MNDY", "CRM", "FRSH"],
  project: ["ASAN", "SMAR", "MNDY"],
  accounting: ["INTU", "XRO.AX", "SGE.L", "TOTS3.SA", "4478.T"],
  payroll: ["ADP", "PAYX", "PAYC", "PCTY", "XYZ"],
  pos: ["TOST", "XYZ", "LSPD", "FI", "DASH"],
  hotel: ["AGYS", "SABR", "SDR.AX"],
  document: ["DOCU", "DBX"],
  ecommerce: ["SHOP", "BIGC", "WIX", "SQSP", "VTEX"],
};

const BASE_DATE = "2026-02-03";

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

function consolidateTimeline(dailyData, baseline) {
  if (!dailyData.length) return { columns: [], rows: {} };

  const sorted = [...dailyData].sort((a, b) => a.date.localeCompare(b.date));
  const baseMs = new Date(BASE_DATE + "T12:00:00").getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const sampled = sorted.filter((s) => {
    const d = new Date(s.date + "T12:00:00").getTime();
    const daysSinceBase = Math.round((d - baseMs) / dayMs);
    return daysSinceBase > 0 && daysSinceBase % 2 === 0;
  });

  const columns = [];
  let dayBuffer = [];
  let weekBuffer = [];
  let weekCount = 0;
  let monthCount = 0;

  for (let i = 0; i < sampled.length; i++) {
    dayBuffer.push(sampled[i]);

    if (dayBuffer.length === 7) {
      weekCount++;
      const startDate = dayBuffer[0].date;
      const endDate = dayBuffer[6].date;
      const weekCol = {
        id: `wk-${weekCount}`,
        label: `Wk ${weekCount}`,
        sublabel: `${fmtShort(startDate)}–${fmtShort(endDate)}`,
        type: "week",
        dates: dayBuffer.map((d) => d.date),
        data: dayBuffer,
      };
      weekBuffer.push(weekCol);
      dayBuffer = [];

      if (weekBuffer.length === 4) {
        monthCount++;
        const monthCol = {
          id: `mo-${monthCount}`,
          label: `Mo ${monthCount}`,
          sublabel: `${weekBuffer[0].sublabel.split("–")[0]}–${weekBuffer[3].sublabel.split("–")[1]}`,
          type: "month",
          dates: weekBuffer.flatMap((w) => w.dates),
          data: weekBuffer.flatMap((w) => w.data),
        };
        columns.push(monthCol);
        weekBuffer = [];
      }
    }
  }

  weekBuffer.forEach((w) => columns.push(w));

  dayBuffer.forEach((d) => {
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

  const rows = {};
  const variability = {};

  function stdDev(pcts) {
    if (pcts.length < 2) return null;
    const mean = pcts.reduce((a, b) => a + b, 0) / pcts.length;
    const variance = pcts.reduce((sum, x) => sum + (x - mean) ** 2, 0) / pcts.length;
    return Math.sqrt(variance);
  }

  const cumulativeRows = {};

  SECTOR_ORDER.forEach((sectorId) => {
    const tickers = SECTOR_TICKERS[sectorId] || [];
    const periodToPrior = [];
    const cumulative = [];
    for (let colIdx = 0; colIdx < columns.length; colIdx++) {
      const col = columns[colIdx];
      const lastDay = col.data[col.data.length - 1];
      if (!lastDay?.tickers) {
        periodToPrior.push(null);
        cumulative.push(null);
        continue;
      }
      const prevCol = colIdx > 0 ? columns[colIdx - 1] : null;
      const prevLastDay = prevCol?.data?.[prevCol.data.length - 1];
      const pctsPeriod = [];
      const pctsCum = [];
      for (const t of tickers) {
        const basePrice = baseline[t];
        const close = lastDay.tickers[t]?.close;
        if (basePrice == null || close == null || basePrice <= 0) continue;
        const cumPct = ((close - basePrice) / basePrice) * 100;
        pctsCum.push(cumPct);
        const prevClose = prevLastDay?.tickers?.[t]?.close ?? basePrice;
        if (prevClose > 0) pctsPeriod.push(((close - prevClose) / prevClose) * 100);
      }
      if (pctsCum.length === 0) {
        periodToPrior.push(null);
        cumulative.push(null);
        continue;
      }
      const avgPeriod = pctsPeriod.length > 0 ? pctsPeriod.reduce((a, b) => a + b, 0) / pctsPeriod.length : null;
      const avgCum = pctsCum.reduce((a, b) => a + b, 0) / pctsCum.length;
      periodToPrior.push(avgPeriod != null ? Math.round(avgPeriod * 100) / 100 : null);
      cumulative.push(Math.round(avgCum * 100) / 100);
      if (colIdx === columns.length - 1) {
        const sd = stdDev(pctsCum);
        variability[sectorId] = sd != null ? Math.round(sd * 100) / 100 : null;
      }
    }
    rows[sectorId] = periodToPrior;
    cumulativeRows[sectorId] = cumulative;
  });

  return { columns, rows, cumulativeRows, variability };
}

function fmtShort(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
  const [categoryFilter, setCategoryFilter] = useState(new Set());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const listRes = await fetch("/api/data/");
      const list = await listRes.json();
      const dailyFiles = list.files.filter((f) => f !== "baseline.json" && f !== "ltm_high.json");

      const [baselineData, ltmHighData, ...snapshots] = await Promise.all([
        fetch("/api/data/baseline.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/data/ltm_high.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ...dailyFiles.map((f) => fetch(`/api/data/${f}`).then((r) => r.json())),
      ]);

      const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
      const firstDay = sorted[0] || null;
      const base = buildBaseline(baselineData, firstDay);
      setBaseline(base);
      setDailyData(snapshots);
      setLtmHighData(ltmHighData);
      if (baselineData?.date) setBaselineDate(baselineData.date);
      else if (firstDay?.date) {
        const prev = new Date(firstDay.date + "T12:00:00");
        prev.setDate(prev.getDate() - 1);
        setBaselineDate(prev.toISOString().slice(0, 10));
      } else setBaselineDate(null);
      setLoading(false);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: theme.textMuted }}>
        <div style={{ fontSize: 13 }}>Loading price data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, background: theme.error.bg, borderRadius: 8, border: `1px solid ${theme.error.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.error.text, marginBottom: 4 }}>Error loading data</div>
        <div style={{ fontSize: 11, color: theme.error.textDark }}>{error}</div>
        <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 8 }}>
          Run <code style={{ background: theme.surfaceAlt, padding: "1px 4px", borderRadius: 3 }}>npm run fetch:backfill</code> to fetch price data.
        </div>
      </div>
    );
  }

  if (!dailyData.length) {
    return (
      <div style={{ padding: 20, background: theme.warning.bg, borderRadius: 8, border: `1px solid ${theme.warning.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.warning.text, marginBottom: 4 }}>No price data yet</div>
        <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.6 }}>
          Run these commands to start tracking:<br />
          <code style={{ background: theme.surfaceAlt, padding: "1px 4px", borderRadius: 3 }}>npm run fetch:backfill</code> — backfill from Feb 3<br />
          <code style={{ background: theme.surfaceAlt, padding: "1px 4px", borderRadius: 3 }}>npm run fetch</code> — fetch today&apos;s prices
        </div>
      </div>
    );
  }

  const { columns, rows, cumulativeRows, variability } = consolidateTimeline(dailyData, baseline || {});

  const baseDateFormatted = formatBaseDate(baselineDate);

  const sectorOrderRaw = [...SECTOR_ORDER].sort((a, b) => {
    const cumA = cumulativeRows[a]?.length ? cumulativeRows[a][cumulativeRows[a].length - 1] : null;
    const cumB = cumulativeRows[b]?.length ? cumulativeRows[b][cumulativeRows[b].length - 1] : null;
    const absA = cumA != null ? Math.abs(cumA) : 0;
    const absB = cumB != null ? Math.abs(cumB) : 0;
    return absB - absA;
  });

  const sectorOrder = categoryFilter.size === 0 ? sectorOrderRaw : sectorOrderRaw.filter((s) => categoryFilter.has(s));

  function toggleCategory(sectorId) {
    if (sectorId === null) setCategoryFilter(new Set());
    else
      setCategoryFilter((prev) => {
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
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textMuted }}>Cumulative Tracker</span>
            {baseDateFormatted && (
              <span
                style={{
                  fontSize: 9,
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontWeight: 700,
                  background: theme.month.light,
                  color: theme.month.text,
                  fontFamily: "monospace",
                }}
              >
                Base: {baseDateFormatted}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: theme.textTertiary, marginTop: 2 }}>% change since SaaSpocalypse base date · {dailyData.length} trading days · auto-consolidates: days → weeks → months</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: theme.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>Filter:</span>
          <button
            onClick={() => toggleCategory(null)}
            style={{
              fontSize: 9,
              padding: "4px 8px",
              borderRadius: 4,
              fontWeight: 700,
              background: isAllActive ? theme.text : theme.surfaceAlt,
              color: isAllActive ? "white" : theme.textSecondary,
              border: "none",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            All
          </button>
          {SECTOR_ORDER.map((sectorId) => {
            const meta = SECTOR_META[sectorId];
            const active = categoryFilter.has(sectorId);
            return (
              <button
                key={sectorId}
                onClick={() => toggleCategory(sectorId)}
                style={{
                  fontSize: 9,
                  padding: "4px 8px",
                  borderRadius: 4,
                  fontWeight: 700,
                  background: active ? meta.color : theme.surfaceAlt,
                  color: active ? "white" : theme.textSecondary,
                  border: "none",
                  cursor: "pointer",
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
          ].map((t) => {
            const count = columns.filter((c) => c.type === t.type).length;
            return count > 0 ? (
              <span
                key={t.type}
                style={{
                  fontSize: 9,
                  padding: "2px 6px",
                  borderRadius: 3,
                  background: t.type === "month" ? theme.month.bg : t.type === "week" ? theme.week.bg : theme.surfaceAlt,
                  color: t.type === "month" ? theme.month.text : t.type === "week" ? theme.week.text : theme.textSecondary,
                  fontWeight: 700,
                  fontFamily: "monospace",
                }}
              >
                {count} {t.label}
                {count > 1 ? "s" : ""}
              </span>
            ) : null;
          })}
        </div>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${theme.border}` }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, minWidth: columns.length * 70 + 320 }}>
          <thead>
            <tr>
              <th style={{ padding: "4px 10px", background: theme.surface, borderBottom: `1px solid ${theme.border}`, position: "sticky", left: 0, zIndex: 2 }} />
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{
                    padding: "2px 4px",
                    textAlign: "center",
                    borderBottom: "none",
                    background: col.type === "month" ? theme.month.bg : col.type === "week" ? theme.week.bg : theme.surface,
                    fontSize: 7,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: col.type === "month" ? theme.month.text : col.type === "week" ? theme.week.text : theme.textTertiary,
                  }}
                >
                  {col.type}
                </th>
              ))}
              <th style={{ padding: "2px 4px", textAlign: "center", borderBottom: "none", background: theme.surface, fontSize: 7, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textTertiary }}>Δ</th>
              <th style={{ padding: "2px 4px", textAlign: "center", borderBottom: "none", background: theme.surface, fontSize: 7, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textTertiary }}>LTM</th>
              <th style={{ padding: "2px 4px", textAlign: "center", borderBottom: "none", background: theme.surface, fontSize: 7, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textTertiary }}>Var</th>
            </tr>
            <tr>
              <th style={{ padding: "6px 10px", textAlign: "left", background: theme.surface, borderBottom: `2px solid ${theme.borderStrong}`, fontSize: 10, fontWeight: 800, position: "sticky", left: 0, zIndex: 2 }}>Sector</th>
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{
                    padding: "4px 6px",
                    textAlign: "center",
                    background: col.type === "month" ? theme.month.light : col.type === "week" ? theme.week.light : theme.surface,
                    borderBottom: `2px solid ${theme.borderStrong}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800 }}>{col.label}</div>
                  <div style={{ fontSize: 8, color: theme.textTertiary, fontWeight: 400 }}>{col.sublabel}</div>
                </th>
              ))}
              <th style={{ padding: "4px 8px", textAlign: "center", background: theme.surface, borderBottom: `2px solid ${theme.borderStrong}`, whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 10, fontWeight: 800 }}>Δ since Feb 3</div>
                <div style={{ fontSize: 8, color: theme.textTertiary, fontWeight: 400 }}>Cumulative</div>
              </th>
              <th style={{ padding: "4px 8px", textAlign: "center", background: theme.surface, borderBottom: `2px solid ${theme.borderStrong}`, whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 10, fontWeight: 800 }}>Δ from LTM High</div>
                <div style={{ fontSize: 8, color: theme.textTertiary, fontWeight: 400 }}>Per sector</div>
              </th>
              <th style={{ padding: "4px 8px", textAlign: "center", background: theme.surface, borderBottom: `2px solid ${theme.borderStrong}`, fontSize: 9, fontWeight: 700, color: theme.textMuted }}>Variability</th>
            </tr>
          </thead>
          <tbody>
            {sectorOrder.map((sectorId) => {
              const meta = SECTOR_META[sectorId];
              const isExpanded = expandedSector === sectorId;
              const sectorData = rows[sectorId] || [];
              const sectorDef = SECTORS.find((s) => s.id === sectorId);
              const publicTickersRaw = sectorDef?.companies.filter((c) => c.status === "public") || [];
              const lastCol = columns[columns.length - 1];
              const lastDay = lastCol?.data?.[lastCol.data.length - 1];
              const base = baseline || {};
              const publicTickers = [...publicTickersRaw].sort((a, b) => {
                const baseA = base[a.ticker];
                const closeA = lastDay?.tickers?.[a.ticker]?.close;
                const cumA = baseA != null && closeA != null && baseA > 0 ? ((closeA - baseA) / baseA) * 100 : null;
                const baseB = base[b.ticker];
                const closeB = lastDay?.tickers?.[b.ticker]?.close;
                const cumB = baseB != null && closeB != null && baseB > 0 ? ((closeB - baseB) / baseB) * 100 : null;
                const absA = cumA != null ? Math.abs(cumA) : 0;
                const absB = cumB != null ? Math.abs(cumB) : 0;
                return absB - absA;
              });

              return (
                <React.Fragment key={sectorId}>
                  <tr onClick={() => setExpandedSector(isExpanded ? null : sectorId)} style={{ cursor: "pointer" }}>
                    <td
                      style={{
                        padding: "8px 10px",
                        fontWeight: 700,
                        background: theme.white,
                        borderBottom: isExpanded ? "none" : `1px solid ${theme.borderLight}`,
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        whiteSpace: "nowrap",
                        fontFamily: "'Newsreader', Georgia, serif",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ marginRight: 4 }}>{meta.icon}</span>
                      {meta.name}
                      <span style={{ color: theme.borderStrong, marginLeft: 4, fontSize: 10 }}>{isExpanded ? "▼" : "▶"}</span>
                    </td>
                    {sectorData.map((val, ci) => {
                      const c = getCellColor(val, "category");
                      return (
                        <td
                          key={ci}
                          style={{
                            padding: "6px 8px",
                            textAlign: "center",
                            background: c.bg,
                            color: c.text,
                            fontWeight: 700,
                            borderBottom: isExpanded ? "none" : `1px solid ${theme.borderLight}`,
                            borderLeft: columns[ci]?.type !== "day" ? `2px solid ${columns[ci]?.type === "month" ? theme.month.border : theme.week.border}` : `1px solid ${theme.borderLight}`,
                          }}
                        >
                          {val !== null ? `${val > 0 ? "+" : ""}${val.toFixed(1)}%` : "—"}
                        </td>
                      );
                    })}
                    {(() => {
                      const cumVal = cumulativeRows[sectorId]?.length ? cumulativeRows[sectorId][cumulativeRows[sectorId].length - 1] : null;
                      const c = cumVal != null ? getCellColor(cumVal, "category") : { bg: theme.surface, text: theme.textMuted };
                      return (
                        <td
                          key="cum"
                          style={{
                            padding: "6px 8px",
                            textAlign: "center",
                            background: c.bg,
                            color: c.text,
                            fontWeight: 700,
                            borderBottom: isExpanded ? "none" : `1px solid ${theme.borderLight}`,
                            borderLeft: `2px solid ${theme.border}`,
                          }}
                        >
                          {cumVal != null ? `${cumVal > 0 ? "+" : ""}${cumVal.toFixed(1)}%` : "—"}
                        </td>
                      );
                    })()}
                    {(() => {
                      const cumVal = cumulativeRows[sectorId]?.length ? cumulativeRows[sectorId][cumulativeRows[sectorId].length - 1] : null;
                      const ltmPct = ltmHighData?.sectors?.[sectorId]?.ltm_high_pct;
                      let deltaLtm = null;
                      if (cumVal != null && ltmPct != null) {
                        const currentIndex = 100 * (1 + cumVal / 100);
                        const ltmHighIndex = 100 * (1 + ltmPct / 100);
                        deltaLtm = Math.round(((currentIndex - ltmHighIndex) / ltmHighIndex) * 1000) / 10;
                      }
                      const c = deltaLtm != null ? getCellColor(deltaLtm, "category") : { bg: theme.surface, text: theme.textMuted };
                      return (
                        <td
                          key="ltm"
                          style={{
                            padding: "6px 8px",
                            textAlign: "center",
                            background: c.bg,
                            color: c.text,
                            fontWeight: 700,
                            borderBottom: isExpanded ? "none" : `1px solid ${theme.borderLight}`,
                            borderLeft: `2px solid ${theme.border}`,
                          }}
                        >
                          {deltaLtm != null ? `${deltaLtm > 0 ? "+" : ""}${deltaLtm.toFixed(1)}%` : "—"}
                        </td>
                      );
                    })()}
                    <td
                      style={{
                        padding: "6px 8px",
                        textAlign: "center",
                        fontSize: 10,
                        background: theme.surface,
                        color: theme.textMuted,
                        fontWeight: 600,
                        borderBottom: isExpanded ? "none" : `1px solid ${theme.borderLight}`,
                      }}
                      title={variability[sectorId] == null && (SECTOR_TICKERS[sectorId]?.length ?? 0) < 2 ? "N/A — needs ≥2 tickers for std dev" : undefined}
                    >
                      {variability[sectorId] != null ? `±${variability[sectorId].toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                  {isExpanded && publicTickers.map((company) => <CompanyRow key={company.ticker} company={company} columns={columns} baseline={baseline || {}} ltmHighData={ltmHighData} />)}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <SectorChart columns={columns} rows={cumulativeRows} baselineDate={baselineDate} ltmHighData={ltmHighData} sectors={sectorOrder} SECTOR_META={SECTOR_META} />

      <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, color: theme.textTertiary, fontWeight: 700 }}>SCALE:</span>
        {[
          { label: "≤-3%", ...getCellColor(-4, "category") },
          { label: "-1 to -3%", ...getCellColor(-2, "category") },
          { label: "-1 to +1%", ...getCellColor(0, "category") },
          { label: "+1 to +3%", ...getCellColor(2, "category") },
          { label: "≥+3%", ...getCellColor(4, "category") },
        ].map((s) => (
          <span key={s.label} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: s.bg, color: s.text, fontWeight: 600 }}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
