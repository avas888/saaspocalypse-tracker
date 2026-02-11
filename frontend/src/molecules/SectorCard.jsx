import { SeverityDot } from "../atoms/index.js";
import { SENTIMENT_COLORS } from "../atoms/tokens/semantic.js";
import { theme } from "../atoms/tokens/theme.js";

function dropColor(avgDrop) {
  if (avgDrop <= -30) return SENTIMENT_COLORS.error;
  if (avgDrop <= -15) return SENTIMENT_COLORS.warning;
  return SENTIMENT_COLORS.success;
}

export default function SectorCard({ sector, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 12px",
        background: "white",
        border: `1px solid ${theme.border}`,
        borderRadius: 8,
        marginBottom: 6,
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = sector.color;
        e.currentTarget.style.transform = "translateX(3px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = theme.border;
        e.currentTarget.style.transform = "none";
      }}
    >
      <div style={{ fontSize: 24, width: 36, textAlign: "center", flexShrink: 0 }}>{sector.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{sector.name}</span>
          <SeverityDot severity={sector.severity} />
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: sector.color }}>{sector.severity}</span>
        </div>
        <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {sector.companies.length} companies tracked · {sector.companies.filter((c) => c.status === "private").length} private
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0, minWidth: 60 }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "monospace",
            color: dropColor(sector.avgDrop),
          }}
        >
          {sector.avgDrop}%
        </div>
        <div style={{ fontSize: 8, color: theme.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em" }} title="Mean of public companies' stock decline from LTM high to Feb 3 baseline">avg drop</div>
      </div>
      <span style={{ color: theme.borderStrong, flexShrink: 0 }}>→</span>
    </button>
  );
}
