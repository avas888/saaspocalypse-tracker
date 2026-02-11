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
      <p style={{ fontSize: 11, color: theme.textMuted, margin: "0 0 12px", lineHeight: 1.5 }}>
        <strong style={{ color: theme.textSecondary }}>Avg drop</strong> = mean of public companies' stock price decline from LTM high to baseline (Feb 3, 2026). Private companies excluded.
      </p>
      {sectors.map((s) => (
        <SectorCard key={s.id} sector={s} onClick={() => onSelectSector(s.id)} />
      ))}
    </div>
  );
}
