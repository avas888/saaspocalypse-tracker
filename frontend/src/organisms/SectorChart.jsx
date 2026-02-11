import React from "react";
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
import { ChartTooltip } from "../molecules/index.js";
import { getCellColor } from "../atoms/tokens/semantic.js";
import { theme } from "../atoms/tokens/theme.js";

const BASE_DATE = "2026-02-03";

function fmtShort(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SectorChart({ columns, rows, baselineDate, ltmHighData, sectors, SECTOR_META }) {
  const zeroDate = BASE_DATE;
  const fmt = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");
  const prePoints = [
    { date: "Feb 3 (zero)", sortKey: zeroDate },
    ...(baselineDate && baselineDate !== zeroDate ? [{ date: `${fmt(baselineDate)} (base)`, sortKey: baselineDate }] : []),
  ];

  const dataPoints = columns.map((col, colIdx) => {
    const lastDay = col.data?.[col.data.length - 1];
    const dateStr = lastDay?.date || col.dates?.[0];
    const point = { date: col.sublabel, label: col.label, sortKey: dateStr || col.sublabel };
    sectors.forEach((sectorId) => {
      point[sectorId] = rows[sectorId]?.[colIdx] ?? null;
    });
    return point;
  });

  const ltmHigh = {};
  const ltmHighDates = {};
  sectors.forEach((sectorId) => {
    if (ltmHighData?.sectors?.[sectorId]?.ltm_high_pct != null) {
      ltmHigh[sectorId] = ltmHighData.sectors[sectorId].ltm_high_pct;
      const d = ltmHighData.sectors[sectorId].high_date;
      if (d) {
        const parsed = new Date(d + "T12:00:00");
        ltmHighDates[sectorId] = parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    } else {
      const values = [0, ...dataPoints.map((p) => p[sectorId]).filter((v) => v != null)];
      ltmHigh[sectorId] = values.length > 0 ? Math.round(Math.max(...values) * 100) / 100 : null;
    }
  });

  const chartData = [
    ...prePoints.map((p) => {
      const pt = { date: p.date, sortKey: p.sortKey };
      sectors.forEach((sectorId) => {
        pt[sectorId] = 0;
      });
      return pt;
    }),
    ...dataPoints,
    { date: "LTM High", sortKey: "2026-02-01", ...ltmHigh },
  ].sort((a, b) => (a.sortKey || "").localeCompare(b.sortKey || ""));

  if (chartData.length === 0) return null;

  const base100Data = chartData.map((p) => {
    const out = { date: p.date, sortKey: p.sortKey };
    sectors.forEach((sectorId) => {
      const raw = p[sectorId];
      const high = ltmHigh[sectorId];
      if (raw == null || high == null) out[sectorId] = null;
      else out[sectorId] = Math.round((100 * (1 + raw / 100)) / (1 + high / 100) * 100) / 100;
    });
    return out;
  });

  const base100Values = base100Data.flatMap((p) => sectors.map((s) => p[s]).filter((v) => v != null));
  const base100Min = base100Values.length ? Math.min(...base100Values) : 60;
  const base100Max = base100Values.length ? Math.max(...base100Values) : 105;
  const base100Domain = [Math.max(base100Min - 5, 50), Math.min(base100Max + 5, 110)];

  const postCrashData = chartData.filter((p) => (p.sortKey || "") >= zeroDate);
  const postCrashValues = postCrashData.flatMap((p) => sectors.map((s) => p[s]).filter((v) => v != null));
  const postCrashMin = postCrashValues.length ? Math.min(...postCrashValues) : -10;
  const postCrashMax = postCrashValues.length ? Math.max(...postCrashValues) : 0;
  const postCrashRange = Math.max(postCrashMax - postCrashMin, 0.5);
  const zoomPadding = Math.max(postCrashRange * 0.15, 0.3);
  const zoomDomain = [postCrashMin - zoomPadding, postCrashMax + zoomPadding];

  return (
    <div style={{ marginTop: 20, borderRadius: 8, border: `1px solid ${theme.border}`, padding: 16, background: theme.surface }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 12 }}>Cumulative % by sector over time</div>
      <div style={{ fontSize: 9, color: theme.textTertiary, marginBottom: 8 }}>Base 100 = LTM High. Date labels show peak timing per sector (dates differ).</div>
      <ResponsiveContainer width="100%" height={390}>
        <LineChart data={base100Data} margin={{ top: 5, right: 30, left: 45, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: theme.textMuted }} />
          <YAxis tick={{ fontSize: 10, fill: theme.textMuted }} domain={base100Domain} />
          <ReferenceLine y={100} stroke={theme.textMuted} strokeWidth={1.5} strokeDasharray="4 4" />
          <Tooltip content={<ChartTooltip formatter={(v) => (v != null ? v.toFixed(1) : "—")} />} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {sectors.map((sectorId) => {
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
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 8 }}>Zoomed: Post-crash (Feb 3 onward) — slope comparison</div>
          <ResponsiveContainer width="100%" height={286}>
            <LineChart data={postCrashData} margin={{ top: 5, right: 30, left: 45, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: theme.textMuted }} />
              <YAxis tickFormatter={(v) => `${Number(v).toFixed(2)}%`} tick={{ fontSize: 10, fill: theme.textMuted }} domain={zoomDomain} />
              <ReferenceLine y={0} stroke={theme.textMuted} strokeWidth={1.5} strokeDasharray="4 4" />
              <Tooltip content={<ChartTooltip formatter={(v) => (v != null ? `${v > 0 ? "+" : ""}${Number(v).toFixed(2)}%` : "—")} />} />
              {sectors.map((sectorId) => {
                const meta = SECTOR_META[sectorId];
                return <Line key={sectorId} type="monotone" dataKey={sectorId} name={meta.name} stroke={meta.color} strokeWidth={2} dot={{ r: 4 }} connectNulls />;
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${theme.border}` }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 8 }}>LTM High (Last Twelve Months)</div>
        <div style={{ fontSize: 8, color: theme.textTertiary, marginBottom: 6 }}>
          Peak % above Feb 3 baseline. Run <code style={{ fontSize: 8 }}>npm run fetch:ltm</code> for real data.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px" }}>
          {sectors.map((sectorId) => {
            const meta = SECTOR_META[sectorId];
            const val = ltmHigh[sectorId];
            const peakDate = ltmHighDates[sectorId];
            const c = getCellColor(val);
            return (
              <span
                key={sectorId}
                style={{
                  fontSize: 10,
                  padding: "2px 6px",
                  borderRadius: 3,
                  background: c.bg,
                  color: c.text,
                  fontWeight: 600,
                }}
              >
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
