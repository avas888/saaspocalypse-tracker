import { theme } from "../atoms/tokens/theme.js";
import { SENTIMENT_COLORS, ACCENT } from "../atoms/tokens/semantic.js";

const FACTORS = [
  { factor: "Pricing Model", red: "Per-seat (CRM, PM, docs)", green: "Per-outcome / usage / payment %" },
  { factor: "Regulatory Moat", red: "None (CRM, PM, design)", green: "Country-specific tax/labor law" },
  { factor: "Data Uniqueness", red: "UI on commodity database", green: "Proprietary ops data (POS txns)" },
  { factor: "AI Relationship", red: "AI replaces the tool", green: "AI is a feature inside the tool" },
  { factor: "Ownership", red: "Public, high-multiple US stock", green: "Private / LatAm / regulatory" },
];

export default function FrameworkSection() {
  return (
    <div>
      <p style={{ fontSize: 13, color: theme.textSecondary, margin: "0 0 16px", lineHeight: 1.6 }}>
        Five factors predict how hard an SMB SaaS company gets hit. The more &quot;red&quot; characteristics a company has, the deeper the damage.
      </p>
      <div
        style={{
          background: theme.white,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        {FACTORS.map((r, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              borderBottom: i < 5 ? `1px solid ${theme.borderLight}` : "none",
            }}
          >
            <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, background: theme.surface }}>{r.factor}</div>
            <div style={{ padding: "10px 12px", fontSize: 11, color: SENTIMENT_COLORS.error, background: "#FEF2F2" }}>{r.red}</div>
            <div style={{ padding: "10px 12px", fontSize: 11, color: SENTIMENT_COLORS.success, background: "#F0FDF4" }}>{r.green}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: 20, background: theme.inverse, borderRadius: 8, color: theme.surface }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px", fontStyle: "italic" }}>Three tiers of SMB SaaS in the SaaSpocalypse</h3>
        <div style={{ fontSize: 12, lineHeight: 1.7 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: ACCENT, fontWeight: 800 }}>🔴 Structurally threatened</span>
            <span style={{ color: theme.borderStrong }}>
              {" "}
              — Per-seat UI wrappers with no moat. CRM, project management, e-signatures, website builders. These face genuine model disruption. Asana (-92% ATH), HubSpot (-51%), DocuSign (-52%).
            </span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: SENTIMENT_COLORS.warning, fontWeight: 800 }}>🟡 Collateral damage / different thesis</span>
            <span style={{ color: theme.borderStrong }}>
              {" "}
              — Strong fundamentals dragged down by panic or a DIFFERENT fear entirely. Paycom (-41%) and Paylocity (-40%) aren&apos;t falling because AI kills payroll software — they&apos;re falling because AI kills JOBS, shrinking the number of paychecks processed. That&apos;s a TAM question, not an existential one. Similarly, Intuit (12% growth), Toast (25% growth) are pure multiple compression.
            </span>
          </div>
          <div>
            <span style={{ color: SENTIMENT_COLORS.success, fontWeight: 800 }}>🟢 AI beneficiaries mislabeled</span>
            <span style={{ color: theme.borderStrong }}>
              {" "}
              — Hardware-linked POS (Toast, Square, Clover), hotel PMS (Mews raised $300M IN January 2026), regulated payroll (Gusto, ADP, CONTPAQi), LatAm accounting (TOTVS, Nubox). AI makes these tools stickier, not obsolete.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
