import { theme } from "./tokens/theme.js";

export default function Badge({ children, color = theme.muted, bg = theme.mutedBg }) {
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 99,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        background: bg,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
