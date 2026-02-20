import React, { useState, useEffect, useMemo } from "react";
import { SECTORS } from "../sectors.js";
import { theme } from "../atoms/tokens/theme.js";

const SECTOR_ORDER = ["crm", "project", "document", "payroll", "accounting", "ecommerce", "pos", "hotel", "consolidators"];
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
  consolidators: ["CSU.TO", "ASUR", "UPLD"],
};

const BASE_DATE = "2026-02-03";

function pickPreferredSnapshot(existing, incoming) {
  const existingIsClose = !existing.time_label;
  const incomingIsClose = !incoming.time_label;
  if (incomingIsClose && !existingIsClose) return incoming;
  if (existingIsClose && !incomingIsClose) return existing;

  const existingFetchedAt = Date.parse(existing.fetched_at || "");
  const incomingFetchedAt = Date.parse(incoming.fetched_at || "");
  if (Number.isFinite(existingFetchedAt) && Number.isFinite(incomingFetchedAt)) {
    return incomingFetchedAt > existingFetchedAt ? incoming : existing;
  }

  return incoming;
}

function normalizeSnapshotsByDate(snapshots) {
  const byDate = new Map();
  for (const snapshot of snapshots) {
    if (!snapshot?.date) continue;
    const existing = byDate.get(snapshot.date);
    if (!existing) {
      byDate.set(snapshot.date, snapshot);
      continue;
    }
    byDate.set(snapshot.date, pickPreferredSnapshot(existing, snapshot));
  }
  return Array.from(byDate.values()).sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
}

function fmtShort(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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

function consolidateTimeline(dailyData) {
  if (!dailyData.length) return [];

  const sorted = [...dailyData].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  const timeline = sorted.filter((s) => (s.date ?? "") >= BASE_DATE);

  const columns = [];
  const fullMonthCount = Math.floor(timeline.length / 28);
  const consumedByMonths = fullMonthCount * 28;
  let weekCount = 0;

  for (let monthIdx = 0; monthIdx < fullMonthCount; monthIdx++) {
    const monthStart = monthIdx * 28;
    const monthData = timeline.slice(monthStart, monthStart + 28);
    weekCount += 4;
    columns.push({
      id: `mo-${monthIdx + 1}`,
      label: `Mo ${monthIdx + 1}`,
      sublabel: `${fmtShort(monthData[0].date)}–${fmtShort(monthData[27].date)}`,
      type: "month",
      data: monthData,
    });
  }

  const afterMonths = timeline.slice(consumedByMonths);
  const fullWeekCount = Math.floor(afterMonths.length / 7);
  const consumedByWeeks = fullWeekCount * 7;

  for (let weekIdx = 0; weekIdx < fullWeekCount; weekIdx++) {
    const weekData = afterMonths.slice(weekIdx * 7, weekIdx * 7 + 7);
    const weekNumber = weekCount + weekIdx + 1;
    columns.push({
      id: `wk-${weekNumber}`,
      label: `Wk ${weekNumber}`,
      sublabel: `${fmtShort(weekData[0].date)}–${fmtShort(weekData[6].date)}`,
      type: "week",
      data: weekData,
    });
  }

  const remainingDays = afterMonths.slice(consumedByWeeks);
  remainingDays.forEach((d) => {
    const dayName = new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
    const timeSuffix = d.time_label ? `-${d.time_label}` : "";
    columns.push({
      id: `day-${d.date}${timeSuffix}`,
      label: dayName,
      sublabel: fmtShort(d.date) + (d.time_label ? ` ${d.time_label}` : ""),
      type: "day",
      data: [d],
    });
  });
  return columns;
}

function estimateArrMultiple(ticker, price, fund) {
  if (!fund || !price || price <= 0) return null;
  const ev = fund.enterprise_value;
  const mc = fund.market_cap;
  const ttmRev = fund.ttm_revenue;
  const refPrice = fund.current_price;
  if (ev == null || mc == null || ttmRev == null || ttmRev <= 0 || refPrice == null || refPrice <= 0) return null;
  const netDebt = ev - mc;
  const historicalMc = mc * (price / refPrice);
  const historicalEv = historicalMc + netDebt;
  if (historicalEv <= 0) return null;
  return Math.round((historicalEv / ttmRev) * 10) / 10;
}

function arrMultColor(val) {
  if (val == null) return theme.textTertiary;
  if (val <= 5) return "#16A34A";
  if (val <= 10) return "#CA8A04";
  if (val <= 20) return "#EA580C";
  return "#DC2626";
}

function ro40Color(val) {
  if (val == null) return theme.textTertiary;
  if (val >= 40) return "#16A34A";
  if (val >= 25) return "#CA8A04";
  return "#DC2626";
}

export default function IndexesTab() {
  const [dailyData, setDailyData] = useState([]);
  const [baseline, setBaseline] = useState(null);
  const [ltmHighData, setLtmHighData] = useState(null);
  const [fundamentals, setFundamentals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSector, setExpandedSector] = useState(null);
  const [metric, setMetric] = useState("arr"); // "arr" | "ro40"

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const listRes = await fetch("/api/data/");
      const list = await listRes.json();
      const dailyFiles = list.files.filter(
        (f) => f !== "baseline.json" && f !== "ltm_high.json" && f !== "fundamentals.json" && f !== "private_health.json" && f !== "sector_news.json"
      );
      const [baselineData, ltmData, fundData, ...snapshots] = await Promise.all([
        fetch("/api/data/baseline.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/data/ltm_high.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/data/fundamentals.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ...dailyFiles.map((f) => fetch(`/api/data/${f}`).then((r) => r.json())),
      ]);
      const valid = snapshots.filter((s) => s && typeof s.date === "string");
      const normalizedSnapshots = normalizeSnapshotsByDate(valid);
      setBaseline(buildBaseline(baselineData, normalizedSnapshots[0]));
      setDailyData(normalizedSnapshots);
      setLtmHighData(ltmData);
      setFundamentals(fundData);
      setLoading(false);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  const columns = useMemo(() => consolidateTimeline(dailyData), [dailyData]);

  const { arrRows, ro40Rows } = useMemo(() => {
    if (!fundamentals?.tickers || !baseline) return { arrRows: {}, ro40Rows: {} };
    const arrRows = {};
    const ro40Rows = {};

    SECTOR_ORDER.forEach((sectorId) => {
      const tickers = SECTOR_TICKERS[sectorId] || [];

      const sectorArrLtm = [];
      const sectorArrBase = [];
      const sectorArrCols = columns.map(() => []);
      const sectorRo40 = [];

      tickers.forEach((ticker) => {
        const fund = fundamentals.tickers[ticker];
        if (!fund) return;

        const ltmHighPrice = ltmHighData?.tickers?.[ticker]?.high_price;
        const basePrice = baseline[ticker];

        const ltmArr = estimateArrMultiple(ticker, ltmHighPrice, fund);
        if (ltmArr != null) sectorArrLtm.push(ltmArr);

        const baseArr = estimateArrMultiple(ticker, basePrice, fund);
        if (baseArr != null) sectorArrBase.push(baseArr);

        columns.forEach((col, ci) => {
          const lastDay = col.data[col.data.length - 1];
          const close = lastDay?.tickers?.[ticker]?.close;
          const colArr = estimateArrMultiple(ticker, close, fund);
          if (colArr != null) sectorArrCols[ci].push(colArr);
        });

        if (fund.rule_of_40 != null) sectorRo40.push(fund.rule_of_40);
      });

      const avg = (arr) => arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

      arrRows[sectorId] = {
        ltm: avg(sectorArrLtm),
        base: avg(sectorArrBase),
        cols: sectorArrCols.map((vals) => avg(vals)),
        tickers: {},
      };

      tickers.forEach((ticker) => {
        const fund = fundamentals.tickers[ticker];
        if (!fund) return;
        const ltmHighPrice = ltmHighData?.tickers?.[ticker]?.high_price;
        const basePrice = baseline[ticker];
        arrRows[sectorId].tickers[ticker] = {
          ltm: estimateArrMultiple(ticker, ltmHighPrice, fund),
          base: estimateArrMultiple(ticker, basePrice, fund),
          cols: columns.map((col) => {
            const lastDay = col.data[col.data.length - 1];
            const close = lastDay?.tickers?.[ticker]?.close;
            return estimateArrMultiple(ticker, close, fund);
          }),
        };
      });

      ro40Rows[sectorId] = {
        value: avg(sectorRo40),
        tickers: {},
      };

      tickers.forEach((ticker) => {
        const fund = fundamentals.tickers[ticker];
        if (!fund) return;
        ro40Rows[sectorId].tickers[ticker] = {
          value: fund.rule_of_40,
          growth: fund.revenue_growth_pct,
          margin: fund.ebitda_margin_pct,
        };
      });
    });

    return { arrRows, ro40Rows };
  }, [fundamentals, baseline, ltmHighData, columns]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: theme.textMuted }}>
        <div style={{ fontSize: 13 }}>Loading index data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, background: theme.error.bg, borderRadius: 8, border: `1px solid ${theme.error.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.error.text, marginBottom: 4 }}>Error loading data</div>
        <div style={{ fontSize: 11, color: theme.error.textDark }}>{error}</div>
      </div>
    );
  }

  if (!fundamentals?.tickers) {
    return (
      <div style={{ padding: 20, background: theme.warning.bg, borderRadius: 8, border: `1px solid ${theme.warning.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.warning.text, marginBottom: 4 }}>No fundamentals data</div>
        <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.6 }}>
          Run <code style={{ background: theme.surfaceAlt, padding: "1px 4px", borderRadius: 3 }}>npm run fetch:fundamentals</code> to fetch EV / Revenue and Rule of 40 data from Yahoo Finance.
        </div>
      </div>
    );
  }

  const isArr = metric === "arr";

  return (
    <div>
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textMuted }}>Fundamental Indexes</span>
            <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, fontWeight: 700, background: theme.month.light, color: theme.month.text, fontFamily: "monospace" }}>
              Source: Yahoo Finance
            </span>
          </div>
          <div style={{ fontSize: 11, color: theme.textTertiary, marginTop: 2 }}>
            {isArr
              ? "EV / LTM Revenue multiple estimated at each date using stock price changes. Same cadence as Tracker."
              : "Revenue Growth % + EBITDA Margin %. Static between quarterly earnings; shown as current value."}
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => setMetric("arr")}
            style={{
              fontSize: 10, padding: "6px 14px", borderRadius: 6,
              border: `1px solid ${isArr ? theme.text : theme.borderLight}`,
              background: isArr ? theme.text : theme.white,
              color: isArr ? "white" : theme.textSecondary,
              fontWeight: isArr ? 800 : 400, cursor: "pointer", fontFamily: "monospace",
            }}
          >
            EV / Revenue (LTM)
          </button>
          <button
            onClick={() => setMetric("ro40")}
            style={{
              fontSize: 10, padding: "6px 14px", borderRadius: 6,
              border: `1px solid ${!isArr ? theme.text : theme.borderLight}`,
              background: !isArr ? theme.text : theme.white,
              color: !isArr ? "white" : theme.textSecondary,
              fontWeight: !isArr ? 800 : 400, cursor: "pointer", fontFamily: "monospace",
            }}
          >
            Rule of 40
          </button>
        </div>
      </div>

      {isArr ? renderArrTable() : renderRo40Table()}

      <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 6 }}>Methodology</div>
        {isArr ? (
          <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6 }}>
            <strong>EV / Revenue (LTM) = Enterprise Value / Last Twelve Months Revenue.</strong> EV at each date is estimated from the current EV by adjusting market cap proportionally to stock price changes (net debt held constant). LTM Revenue is held constant between quarterly earnings. Values shown as Nx (e.g. 8.5x = EV is 8.5 times annual revenue).
          </div>
        ) : (
          <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.6 }}>
            <strong>Rule of 40 = YoY Revenue Growth % + EBITDA Margin %.</strong> A score of 40 or above indicates a healthy SaaS company balancing growth and profitability. This metric changes quarterly with earnings reports. Green = 40+, yellow = 25-39, red = below 25.
          </div>
        )}
      </div>
    </div>
  );

  function renderArrTable() {
    return (
      <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${theme.border}` }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, minWidth: (columns.length + 2) * 70 + 200 }}>
          <thead>
            <tr>
              <th style={{ padding: "4px 10px", background: theme.surface, borderBottom: `1px solid ${theme.border}`, position: "sticky", left: 0, zIndex: 2 }} />
              <th style={{ padding: "2px 4px", textAlign: "center", borderBottom: "none", background: theme.surface, fontSize: 7, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textTertiary }}>LTM</th>
              <th style={{ padding: "2px 4px", textAlign: "center", borderBottom: "none", background: theme.surface, fontSize: 7, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textTertiary }}>Base</th>
              {columns.map((col) => (
                <th key={col.id} style={{ padding: "2px 4px", textAlign: "center", borderBottom: "none", background: col.type === "month" ? theme.month.bg : col.type === "week" ? theme.week.bg : theme.surface, fontSize: 7, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: col.type === "month" ? theme.month.text : col.type === "week" ? theme.week.text : theme.textTertiary }}>
                  {col.type}
                </th>
              ))}
            </tr>
            <tr>
              <th style={{ padding: "6px 10px", textAlign: "left", background: theme.surface, borderBottom: `2px solid ${theme.borderStrong}`, fontSize: 10, fontWeight: 800, position: "sticky", left: 0, zIndex: 2 }}>Sector / Company</th>
              <th style={{ padding: "4px 8px", textAlign: "center", background: theme.surface, borderBottom: `2px solid ${theme.borderStrong}`, whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 10, fontWeight: 800 }}>LTM High</div>
                <div style={{ fontSize: 8, color: theme.textTertiary, fontWeight: 400 }}>Peak EV/Rev</div>
              </th>
              <th style={{ padding: "4px 8px", textAlign: "center", background: theme.surface, borderBottom: `2px solid ${theme.borderStrong}`, whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 10, fontWeight: 800 }}>Feb 3</div>
                <div style={{ fontSize: 8, color: theme.textTertiary, fontWeight: 400 }}>Baseline</div>
              </th>
              {columns.map((col) => (
                <th key={col.id} style={{ padding: "4px 6px", textAlign: "center", background: col.type === "month" ? theme.month.light : col.type === "week" ? theme.week.light : theme.surface, borderBottom: `2px solid ${theme.borderStrong}`, whiteSpace: "nowrap" }}>
                  <div style={{ fontSize: 11, fontWeight: 800 }}>{col.label}</div>
                  <div style={{ fontSize: 8, color: theme.textTertiary, fontWeight: 400 }}>{col.sublabel}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SECTOR_ORDER.map((sectorId) => {
              const meta = SECTOR_META[sectorId];
              const row = arrRows[sectorId];
              if (!row) return null;
              const isExpanded = expandedSector === sectorId;
              const sectorDef = SECTORS.find((s) => s.id === sectorId);
              const publicTickers = (sectorDef?.companies || []).filter((c) => c.status === "public" && row.tickers[c.ticker]);

              return (
                <React.Fragment key={sectorId}>
                  <tr onClick={() => setExpandedSector(isExpanded ? null : sectorId)} style={{ cursor: "pointer" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 700, background: isExpanded ? theme.surfaceAlt : theme.surface, borderBottom: isExpanded ? "none" : `1px solid ${theme.borderLight}`, position: "sticky", left: 0, zIndex: 1, whiteSpace: "nowrap", fontFamily: "'Newsreader', Georgia, serif", fontSize: 12 }}>
                      <span style={{ marginRight: 4 }}>{meta.icon}</span>
                      {meta.name}
                      <span style={{ color: theme.borderStrong, marginLeft: 4, fontSize: 10 }}>{isExpanded ? "▼" : "▶"}</span>
                    </td>
                    {renderArrCell(row.ltm, isExpanded, true)}
                    {renderArrCell(row.base, isExpanded, true)}
                    {row.cols.map((val, ci) => renderArrCell(val, isExpanded, false, columns[ci], ci))}
                  </tr>
                  {isExpanded && publicTickers.map((company) => {
                    const tr = row.tickers[company.ticker];
                    if (!tr) return null;
                    return (
                      <tr key={company.ticker}>
                        <td style={{ padding: "4px 10px 4px 28px", fontSize: 10, color: theme.textMuted, background: theme.surfaceAlt, borderBottom: `1px solid ${theme.borderLight}`, position: "sticky", left: 0, zIndex: 1, whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>
                          {company.name} <span style={{ color: theme.textTertiary }}>{company.ticker}</span>
                        </td>
                        {renderArrCell(tr.ltm, false, true, null, "ltm", true)}
                        {renderArrCell(tr.base, false, true, null, "base", true)}
                        {tr.cols.map((val, ci) => renderArrCell(val, false, false, columns[ci], ci, true))}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderArrCell(val, isExpanded, isBorderLeft, col, key, isChild) {
    const borderLeft = isBorderLeft
      ? `2px solid ${theme.border}`
      : col?.type !== "day"
        ? `2px solid ${col?.type === "month" ? theme.month.border : theme.week.border}`
        : `1px solid ${theme.borderLight}`;
    return (
      <td
        key={key}
        style={{
          padding: isChild ? "4px 6px" : "6px 8px",
          textAlign: "center",
          fontSize: 10,
          background: isExpanded ? theme.surfaceAlt : isChild ? theme.surfaceAlt : theme.surface,
          color: arrMultColor(val),
          fontWeight: isChild ? 600 : 700,
          borderBottom: isExpanded && !isChild ? "none" : `1px solid ${theme.borderLight}`,
          borderLeft,
        }}
      >
        {val != null ? `${val.toFixed(1)}x` : "—"}
      </td>
    );
  }

  function renderRo40Table() {
    return (
      <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${theme.border}` }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ padding: "6px 10px", textAlign: "left", background: theme.surface, borderBottom: `2px solid ${theme.borderStrong}`, fontSize: 10, fontWeight: 800, position: "sticky", left: 0, zIndex: 2 }}>Sector / Company</th>
              <th style={{ padding: "4px 12px", textAlign: "center", background: theme.surface, borderBottom: `2px solid ${theme.borderStrong}`, whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 10, fontWeight: 800 }}>Rule of 40</div>
                <div style={{ fontSize: 8, color: theme.textTertiary, fontWeight: 400 }}>Growth + Margin</div>
              </th>
              <th style={{ padding: "4px 12px", textAlign: "center", background: theme.surface, borderBottom: `2px solid ${theme.borderStrong}`, whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 10, fontWeight: 800 }}>Rev Growth</div>
                <div style={{ fontSize: 8, color: theme.textTertiary, fontWeight: 400 }}>YoY %</div>
              </th>
              <th style={{ padding: "4px 12px", textAlign: "center", background: theme.surface, borderBottom: `2px solid ${theme.borderStrong}`, whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 10, fontWeight: 800 }}>EBITDA Margin</div>
                <div style={{ fontSize: 8, color: theme.textTertiary, fontWeight: 400 }}>%</div>
              </th>
              <th style={{ padding: "4px 12px", textAlign: "center", background: theme.surface, borderBottom: `2px solid ${theme.borderStrong}`, whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 10, fontWeight: 800 }}>Pass?</div>
                <div style={{ fontSize: 8, color: theme.textTertiary, fontWeight: 400 }}>≥ 40</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {SECTOR_ORDER.map((sectorId) => {
              const meta = SECTOR_META[sectorId];
              const row = ro40Rows[sectorId];
              if (!row) return null;
              const isExpanded = expandedSector === sectorId;
              const sectorDef = SECTORS.find((s) => s.id === sectorId);
              const publicTickers = (sectorDef?.companies || []).filter((c) => c.status === "public" && row.tickers[c.ticker]);

              return (
                <React.Fragment key={sectorId}>
                  <tr onClick={() => setExpandedSector(isExpanded ? null : sectorId)} style={{ cursor: "pointer" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 700, background: isExpanded ? theme.surfaceAlt : theme.surface, borderBottom: isExpanded ? "none" : `1px solid ${theme.borderLight}`, position: "sticky", left: 0, zIndex: 1, whiteSpace: "nowrap", fontFamily: "'Newsreader', Georgia, serif", fontSize: 12 }}>
                      <span style={{ marginRight: 4 }}>{meta.icon}</span>
                      {meta.name}
                      <span style={{ color: theme.borderStrong, marginLeft: 4, fontSize: 10 }}>{isExpanded ? "▼" : "▶"}</span>
                    </td>
                    <td style={{ padding: "6px 12px", textAlign: "center", fontSize: 13, fontWeight: 800, color: ro40Color(row.value), background: isExpanded ? theme.surfaceAlt : theme.surface, borderBottom: isExpanded ? "none" : `1px solid ${theme.borderLight}`, borderLeft: `2px solid ${theme.border}` }}>
                      {row.value != null ? row.value.toFixed(0) : "—"}
                    </td>
                    <td style={{ padding: "6px 12px", textAlign: "center", fontSize: 10, color: theme.textMuted, background: isExpanded ? theme.surfaceAlt : theme.surface, borderBottom: isExpanded ? "none" : `1px solid ${theme.borderLight}`, borderLeft: `1px solid ${theme.borderLight}` }}>—</td>
                    <td style={{ padding: "6px 12px", textAlign: "center", fontSize: 10, color: theme.textMuted, background: isExpanded ? theme.surfaceAlt : theme.surface, borderBottom: isExpanded ? "none" : `1px solid ${theme.borderLight}`, borderLeft: `1px solid ${theme.borderLight}` }}>—</td>
                    <td style={{ padding: "6px 12px", textAlign: "center", fontSize: 10, fontWeight: 700, color: row.value != null ? (row.value >= 40 ? "#16A34A" : "#DC2626") : theme.textTertiary, background: isExpanded ? theme.surfaceAlt : theme.surface, borderBottom: isExpanded ? "none" : `1px solid ${theme.borderLight}`, borderLeft: `1px solid ${theme.borderLight}` }}>
                      {row.value != null ? (row.value >= 40 ? "YES" : "NO") : "—"}
                    </td>
                  </tr>
                  {isExpanded && publicTickers.map((company) => {
                    const tr = row.tickers[company.ticker];
                    if (!tr) return null;
                    return (
                      <tr key={company.ticker}>
                        <td style={{ padding: "4px 10px 4px 28px", fontSize: 10, color: theme.textMuted, background: theme.surfaceAlt, borderBottom: `1px solid ${theme.borderLight}`, position: "sticky", left: 0, zIndex: 1, whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>
                          {company.name} <span style={{ color: theme.textTertiary }}>{company.ticker}</span>
                        </td>
                        <td style={{ padding: "4px 12px", textAlign: "center", fontSize: 11, fontWeight: 700, color: ro40Color(tr.value), background: theme.surfaceAlt, borderBottom: `1px solid ${theme.borderLight}`, borderLeft: `2px solid ${theme.border}` }}>
                          {tr.value != null ? tr.value.toFixed(0) : "—"}
                        </td>
                        <td style={{ padding: "4px 12px", textAlign: "center", fontSize: 10, color: theme.textSecondary, background: theme.surfaceAlt, borderBottom: `1px solid ${theme.borderLight}`, borderLeft: `1px solid ${theme.borderLight}` }}>
                          {tr.growth != null ? `${tr.growth > 0 ? "+" : ""}${tr.growth.toFixed(1)}%` : "—"}
                        </td>
                        <td style={{ padding: "4px 12px", textAlign: "center", fontSize: 10, color: theme.textSecondary, background: theme.surfaceAlt, borderBottom: `1px solid ${theme.borderLight}`, borderLeft: `1px solid ${theme.borderLight}` }}>
                          {tr.margin != null ? `${tr.margin.toFixed(1)}%` : "—"}
                        </td>
                        <td style={{ padding: "4px 12px", textAlign: "center", fontSize: 10, fontWeight: 700, color: tr.value != null ? (tr.value >= 40 ? "#16A34A" : "#DC2626") : theme.textTertiary, background: theme.surfaceAlt, borderBottom: `1px solid ${theme.borderLight}`, borderLeft: `1px solid ${theme.borderLight}` }}>
                          {tr.value != null ? (tr.value >= 40 ? "YES" : "NO") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
