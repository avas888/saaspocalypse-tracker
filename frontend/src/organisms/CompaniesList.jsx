import { Badge } from "../atoms/index.js";
import { SENTIMENT_COLORS } from "../atoms/tokens/semantic.js";
import { theme } from "../atoms/tokens/theme.js";

function dropColor(drop) {
  if (drop <= -40) return SENTIMENT_COLORS.error;
  if (drop <= -20) return "#FF7F00";
  if (drop <= -10) return SENTIMENT_COLORS.warning;
  return SENTIMENT_COLORS.success;
}

export default function CompaniesList({ publicCos }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: theme.textSecondary, margin: "0 0 12px" }}>
        {publicCos.length} public companies ranked by 12-month decline. The spread from -{Math.abs(publicCos[0]?.drop)}% to -{Math.abs(publicCos[publicCos.length - 1]?.drop)}% shows this is not one trade.
      </p>
      <p style={{ fontSize: 11, color: theme.textMuted, margin: "0 0 12px", lineHeight: 1.5 }}>
        <strong style={{ color: theme.textSecondary }}>% =</strong> stock price decline from LTM high to baseline (Feb 3, 2026).
      </p>
      <div style={{ background: theme.white, border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden" }}>
        {publicCos.map((c, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderBottom: i < publicCos.length - 1 ? `1px solid ${theme.borderLight}` : "none",
              fontSize: 12,
            }}
          >
            <div style={{ width: 42, fontWeight: 800, fontFamily: "monospace", flexShrink: 0, color: dropColor(c.drop) }}>{c.drop}%</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 700 }}>{c.name}</span>
              <span style={{ fontSize: 9, color: theme.textTertiary, fontFamily: "monospace", marginLeft: 4 }}>{c.ticker}</span>
            </div>
            <Badge color={c.sectorColor} bg={c.sectorColor + "12"}>
              {c.sectorIcon} {c.sectorName.split(" ")[0]}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
