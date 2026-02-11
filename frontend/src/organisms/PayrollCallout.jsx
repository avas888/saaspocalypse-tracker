export default function PayrollCallout() {
  return (
    <div
      style={{
        padding: 18,
        marginBottom: 16,
        borderRadius: 8,
        background: "linear-gradient(135deg, #1E1B4B, #312E81)",
        color: "#E0E7FF",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          fontSize: 80,
          opacity: 0.06,
          fontWeight: 900,
          lineHeight: 1,
          color: "white",
        }}
      >
        ≠
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#A5B4FC",
          marginBottom: 8,
        }}
      >
        🚨 Why payroll is NOT the same story as CRM
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div
          style={{
            padding: 12,
            background: "rgba(238,102,119,0.12)",
            borderRadius: 6,
            border: "1px solid rgba(238,102,119,0.25)",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, color: "#FCA5A5", marginBottom: 4 }}>CRM / PM / DOCS THESIS:</div>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: "#E0E7FF" }}>
            "AI replaces the <span style={{ fontWeight: 800, color: "#FCA5A5", textDecoration: "underline" }}>software</span>. An agent does the work the tool used to do. You cancel the subscription."
          </div>
        </div>
        <div
          style={{
            padding: 12,
            background: "rgba(34,136,51,0.12)",
            borderRadius: 6,
            border: "1px solid rgba(34,136,51,0.25)",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, color: "#6EE7B7", marginBottom: 4 }}>PAYROLL THESIS:</div>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: "#E0E7FF" }}>
            "AI replaces the <span style={{ fontWeight: 800, color: "#6EE7B7", textDecoration: "underline" }}>workers</span> who get paid. Fewer employees = fewer paychecks = smaller TAM. But the software itself is still essential."
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: "#C7D2FE", lineHeight: 1.5, fontStyle: "italic" }}>
        This means payroll software doesn&apos;t face an existential threat — it faces a market-size question. Every remaining employee still needs compliant, error-free payroll. The stocks are pricing in a smaller future customer base, not obsolescence.
      </div>
    </div>
  );
}
