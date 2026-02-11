import { getCellColor } from "../atoms/tokens/semantic.js";
import { theme } from "../atoms/tokens/theme.js";

export default function CompanyRow({ company, columns, baseline, ltmHighData }) {
  const base = baseline[company.ticker];
  const vals = columns.map((col, colIdx) => {
    const lastDay = col.data[col.data.length - 1];
    const close = lastDay?.tickers?.[company.ticker]?.close;
    if (base == null || close == null || base <= 0) return null;
    const prevCol = colIdx > 0 ? columns[colIdx - 1] : null;
    const prevLastDay = prevCol?.data?.[prevCol.data.length - 1];
    const prevClose = prevLastDay?.tickers?.[company.ticker]?.close ?? base;
    if (prevClose <= 0) return null;
    return Math.round(((close - prevClose) / prevClose) * 10000) / 100;
  });
  const cumVal = (() => {
    if (!base || base <= 0 || columns.length === 0) return null;
    const lastCol = columns[columns.length - 1];
    const lastDay = lastCol?.data?.[lastCol.data.length - 1];
    const close = lastDay?.tickers?.[company.ticker]?.close;
    if (close == null) return null;
    return Math.round(((close - base) / base) * 10000) / 100;
  })();

  return (
    <tr>
      <td
        style={{
          padding: "4px 10px 4px 28px",
          fontSize: 10,
          color: theme.textMuted,
          background: theme.surface,
          borderBottom: `1px solid ${theme.borderLight}`,
          position: "sticky",
          left: 0,
          zIndex: 1,
          whiteSpace: "nowrap",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {company.name} <span style={{ color: theme.textTertiary }}>{company.ticker}</span>
      </td>
      {vals.map((val, ci) => {
        const c = getCellColor(val);
        return (
          <td
            key={ci}
            style={{
              padding: "4px 6px",
              textAlign: "center",
              fontSize: 10,
              background: c.bg,
              color: c.text,
              fontWeight: 600,
              borderBottom: `1px solid ${theme.borderLight}`,
              borderLeft: columns[ci]?.type !== "day" ? `2px solid ${columns[ci]?.type === "month" ? theme.month.border : theme.week.border}` : `1px solid ${theme.borderLight}`,
            }}
          >
            {val !== null ? `${val > 0 ? "+" : ""}${val.toFixed(1)}%` : "—"}
          </td>
        );
      })}
      {(() => {
        const c = cumVal != null ? getCellColor(cumVal) : { bg: theme.surface, text: theme.textTertiary };
        return (
          <td
            key="cum"
            style={{
              padding: "4px 8px",
              textAlign: "center",
              fontSize: 10,
              background: c.bg,
              color: c.text,
              fontWeight: 600,
              borderBottom: `1px solid ${theme.borderLight}`,
              borderLeft: `2px solid ${theme.border}`,
            }}
          >
            {cumVal != null ? `${cumVal > 0 ? "+" : ""}${cumVal.toFixed(1)}%` : "—"}
          </td>
        );
      })()}
      {(() => {
        const ltmPct = ltmHighData?.tickers?.[company.ticker]?.ltm_high_pct;
        let deltaLtm = null;
        if (cumVal != null && ltmPct != null) {
          const currentIndex = 100 * (1 + cumVal / 100);
          const ltmHighIndex = 100 * (1 + ltmPct / 100);
          deltaLtm = Math.round(((currentIndex - ltmHighIndex) / ltmHighIndex) * 1000) / 10;
        }
        const c = deltaLtm != null ? getCellColor(deltaLtm) : { bg: theme.surface, text: theme.textTertiary };
        return (
          <td
            key="ltm"
            style={{
              padding: "4px 8px",
              textAlign: "center",
              fontSize: 10,
              background: c.bg,
              color: c.text,
              fontWeight: 600,
              borderBottom: `1px solid ${theme.borderLight}`,
              borderLeft: `2px solid ${theme.border}`,
            }}
          >
            {deltaLtm != null ? `${deltaLtm > 0 ? "+" : ""}${deltaLtm.toFixed(1)}%` : "—"}
          </td>
        );
      })()}
      <td style={{ padding: "4px 8px", textAlign: "center", fontSize: 10, color: theme.textTertiary, background: theme.surface, borderBottom: `1px solid ${theme.borderLight}` }}>—</td>
    </tr>
  );
}
