import { theme } from "../atoms/tokens/theme.js";

export default function ChartTooltip({ active, payload, label, formatter, sortDesc = false }) {
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
    <div
      style={{
        background: theme.white,
        padding: "8px 12px",
        borderRadius: 6,
        border: `1px solid ${theme.border}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        fontSize: 11,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {sorted.map((entry) => (
        <div key={entry.dataKey} style={{ color: entry.color, margin: "2px 0" }}>
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </div>
      ))}
    </div>
  );
}
