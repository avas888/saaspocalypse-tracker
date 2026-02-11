import { theme } from "../atoms/tokens/theme.js";

export default function PrivateCompaniesList({ privateCos }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: theme.textSecondary, margin: "0 0 4px" }}>
        {privateCos.length} private SMB SaaS companies — shielded from public market panic but facing the same structural questions.
      </p>
      <p style={{ fontSize: 11, color: theme.textTertiary, margin: "0 0 14px" }}>
        Key observation: the most PROTECTED sectors (payroll, hotel PMS, restaurant POS) have the highest proportion of private companies.
      </p>
      <div style={{ background: theme.white, border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden" }}>
        {privateCos.map((c, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderBottom: i < privateCos.length - 1 ? `1px solid ${theme.borderLight}` : "none",
              fontSize: 12,
            }}
          >
            <div style={{ width: 20, textAlign: "center", flexShrink: 0 }}>{c.sectorIcon}</div>
            <span style={{ fontWeight: 700, flex: 1 }}>{c.name}</span>
            <span style={{ fontSize: 10, color: theme.textMuted, maxWidth: 220, textAlign: "right" }}>{c.note.substring(0, 60)}…</span>
          </div>
        ))}
      </div>
    </div>
  );
}
