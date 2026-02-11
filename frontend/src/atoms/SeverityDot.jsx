import { SEVERITY_COLORS } from "./tokens/semantic.js";

export default function SeverityDot({ severity }) {
  const color = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.moderate;
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        marginRight: 6,
      }}
    />
  );
}
