import { theme } from "./tokens/theme.js";

const LABEL_TO_NUM = { Extreme: 100, "Very High": 85, High: 70, Medium: 50, Low: 30, None: 0 };

export default function Bar({ value, max = 100, color = "#4477AA", label }) {
  const numVal = typeof value === "string" ? (LABEL_TO_NUM[value] ?? 50) : Math.abs(Number(value));
  const pct = Math.min((numVal / max) * 100, 100);
  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: theme.textMuted,
          marginBottom: 1,
        }}
      >
        <span>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 3, background: theme.surfaceAlt, borderRadius: 2 }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 2,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}
