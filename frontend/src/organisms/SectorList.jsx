import { SECTORS } from "../sectors.js";
import { SectorCard } from "../molecules/index.js";
import { theme } from "../atoms/tokens/theme.js";

const severity_order = { catastrophic: 0, severe: 1, moderate: 2, low: 3 };

export default function SectorList({ onSelectSector, sorted }) {
  const sectors = sorted ?? [...SECTORS].sort((a, b) => severity_order[a.severity] - severity_order[b.severity] || a.avgDrop - b.avgDrop);

  return (
    <div>
      <p style={{ fontSize: 13, color: theme.textSecondary, margin: "0 0 16px", lineHeight: 1.6 }}>
        Eight SMB SaaS verticals sorted by AI vulnerability. Click any to explore companies, moats, and the real thesis.
      </p>
      <div
        style={{
          padding: "14px 16px",
          background: theme.surfaceAlt,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          marginBottom: 20,
          borderLeft: `4px solid ${theme.textMuted}`,
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 6 }}>
          Methodology
        </div>
        <div style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.7 }}>
          <strong style={{ color: theme.text }}>Two columns:</strong>
          <br />
          <strong>LTM high</strong> = mean % drop from each company's last-twelve-months high to baseline (Feb 3, 2026).
          <br />
          <strong>Feb 3</strong> = mean % drop from SaaSpocalypse baseline (Feb 3, 2026) to current price.
          <br />
          <span style={{ fontSize: 11, color: theme.textMuted }}>Private companies excluded from averages.</span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 12px 10px",
          marginBottom: 4,
          fontSize: 9,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: theme.textMuted,
          background: theme.surfaceAlt,
          borderRadius: 6,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div style={{ width: 36, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>Sector</div>
        <div style={{ width: 52, textAlign: "right" }}>LTM high</div>
        <div style={{ width: 52, textAlign: "right" }}>Feb 3</div>
        <div style={{ width: 12, flexShrink: 0 }} />
      </div>
      {sectors.map((s) => (
        <SectorCard key={s.id} sector={s} onClick={() => onSelectSector(s.id)} />
      ))}
    </div>
  );
}
