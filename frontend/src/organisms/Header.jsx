import { ACCENT } from "../atoms/tokens/semantic.js";
import { theme } from "../atoms/tokens/theme.js";

export default function Header() {
  return (
    <div
      style={{
        background: `linear-gradient(145deg, ${theme.inverse}, ${theme.inverseMid} 50%, ${theme.inverseLight})`,
        color: theme.surface,
        padding: "36px 20px 28px",
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          SMB SaaS Deep Dive · Feb 3, 2026
        </div>
        <h1
          style={{
            fontSize: "clamp(24px, 5vw, 38px)",
            fontWeight: 400,
            lineHeight: 1.1,
            margin: "0 0 10px",
            fontStyle: "italic",
          }}
        >
          Not All SMB SaaS Is <span style={{ color: ACCENT, fontWeight: 800, fontStyle: "normal" }}>Hit</span> Equally
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: theme.textTertiary,
            margin: 0,
            maxWidth: 560,
          }}
        >
          $285B erased in the AI uncertainty wave. But a restaurant POS terminal and a project management app have nothing in common except the SaaS label. Eight verticals. 60+ companies. The dispersion is the story.
        </p>
      </div>
    </div>
  );
}
