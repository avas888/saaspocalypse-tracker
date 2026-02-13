import { theme } from "../atoms/tokens/theme.js";

const TABS = [
  { id: "tracker", label: "📈 Tracker" },
  { id: "sectors", label: "Sectors" },
  { id: "sector-news", label: "Relevant Sector News" },
  { id: "companies", label: "Public Cos" },
  { id: "private", label: "Private Cos" },
  { id: "analysis", label: "Analysis" },
  { id: "framework", label: "Framework" },
];

export default function TabNav({ tab, onTabChange }) {
  return (
    <div
      style={{
        borderBottom: `1px solid ${theme.border}`,
        background: theme.background,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              padding: "12px 16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              borderBottom: tab === t.id ? `2px solid ${theme.text}` : "2px solid transparent",
              fontSize: 12,
              fontWeight: tab === t.id ? 800 : 400,
              color: tab === t.id ? theme.text : theme.textMuted,
              fontFamily: "monospace",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
