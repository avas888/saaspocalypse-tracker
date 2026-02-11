import { theme } from "../atoms/tokens/theme.js";
import { Header, TabNav } from "../organisms/index.js";

export default function MainLayout({ tab, onTabChange, children }) {
  return (
    <div
      style={{
        fontFamily: "'Newsreader', Georgia, serif",
        background: theme.background,
        minHeight: "100vh",
        color: theme.text,
      }}
    >
      <Header />
      <TabNav tab={tab} onTabChange={onTabChange} />
      <div style={{ maxWidth: tab === "tracker" ? 1000 : 700, margin: "0 auto", padding: "20px 16px", transition: "max-width 0.3s" }}>{children}</div>
      <div
        style={{
          padding: "16px 20px",
          borderTop: `1px solid ${theme.border}`,
          marginTop: 32,
          textAlign: "center",
          fontSize: 9,
          color: theme.textTertiary,
          fontFamily: "monospace",
        }}
      >
        Market data as of Feb 3, 2026. Sources: Bloomberg, CNBC, Seeking Alpha, SaaStr, Fintech Brainfood, company filings, Mordor Intelligence. Not financial advice.
      </div>
    </div>
  );
}
