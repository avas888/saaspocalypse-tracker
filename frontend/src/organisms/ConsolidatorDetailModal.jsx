import { SECTORS } from "../sectors.js";
import { SENTIMENT_COLORS } from "../atoms/tokens/semantic.js";
import { theme } from "../atoms/tokens/theme.js";

function getSemaphoreColor(d) {
  if (d?.sentiment) return d.sentiment === "green" ? SENTIMENT_COLORS.success : d.sentiment === "red" ? SENTIMENT_COLORS.error : SENTIMENT_COLORS.warning;
  const v = d?.verdict || "";
  if (v.startsWith("MOSTLY HYPE")) return SENTIMENT_COLORS.success;
  if (v.startsWith("MOSTLY REAL")) return SENTIMENT_COLORS.error;
  if (v.startsWith("REAL ECONOMICS + HYPE") || v.startsWith("MIXED")) return SENTIMENT_COLORS.warning;
  if (v.startsWith("REAL")) return SENTIMENT_COLORS.error;
  return SENTIMENT_COLORS.warning;
}

export default function ConsolidatorDetailModal({ company, sectorColor, onClose }) {
  const detail = company?.consolidatorDetail;
  if (!detail) return null;

  const similarSectorDefs = (detail.similarSectors || []).map((id) => SECTORS.find((s) => s.id === id)).filter(Boolean);
  const hasAnalyst = !!detail.analystDetail;
  const semaphoreColor = hasAnalyst ? getSemaphoreColor(detail.analystDetail) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consolidator-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        style={{
          background: theme.surface,
          borderRadius: 12,
          border: `1px solid ${theme.border}`,
          maxWidth: 560,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <h2 id="consolidator-modal-title" style={{ fontSize: 18, fontWeight: 700, margin: 0, color: theme.text }}>
                {company.name}
              </h2>
              <span style={{ fontSize: 11, color: theme.textTertiary, fontFamily: "monospace", marginTop: 4, display: "inline-block" }}>
                {company.ticker}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 18,
                color: theme.textMuted,
                padding: 4,
                lineHeight: 1,
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ padding: "16px 24px 24px" }}>
          {/* Focus */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 6 }}>
              Focus
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: theme.textSecondary, margin: 0 }}>{detail.focus}</p>
          </div>

          {/* Investment thesis */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 6 }}>
              Investment thesis
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: theme.textSecondary, margin: 0 }}>{detail.investmentThesis}</p>
          </div>

          {/* Similar sectors */}
          {similarSectorDefs.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 8 }}>
                Similar sectors
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {similarSectorDefs.map((s) => (
                  <span
                    key={s.id}
                    style={{
                      fontSize: 10,
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: (s.color || sectorColor) + "15",
                      color: s.color || sectorColor,
                      fontWeight: 700,
                      border: `1px solid ${(s.color || sectorColor) + "40"}`,
                    }}
                  >
                    {s.icon} {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Analyst opinion card — same design as SectorDetail */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 8 }}>
              Latest analyst opinion
            </div>
            {hasAnalyst ? (
              <div
                style={{
                  border: `1px solid ${sectorColor}`,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    background: theme.surfaceAlt,
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                    borderBottom: `1px solid ${theme.borderLight}`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: theme.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Analyst Consensus
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>{detail.analystDetail.consensus}</div>
                    {detail.analystDetail.consensusDate && (
                      <div style={{ fontSize: 9, color: theme.textTertiary, marginTop: 2 }}>As of {detail.analystDetail.consensusDate}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: theme.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Median Target
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: theme.text, fontFamily: "monospace" }}>{detail.analystDetail.targetMedian}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: theme.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" }}>Range</div>
                    <div style={{ fontSize: 12, color: theme.textSecondary, fontFamily: "monospace" }}>{detail.analystDetail.targetRange}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: theme.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" }}>Analysts</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>{detail.analystDetail.analystCount}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  <div style={{ padding: "12px 14px", background: "#F0FDF4", borderRight: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: SENTIMENT_COLORS.success, letterSpacing: "0.1em", marginBottom: 6 }}>
                      🐂 BULL CASE{detail.analystDetail.bullCaseDate ? ` · ${detail.analystDetail.bullCaseDate}` : ""}
                    </div>
                    <div style={{ fontSize: 11, lineHeight: 1.55, color: "#14532D" }}>{detail.analystDetail.bullCase}</div>
                  </div>
                  <div style={{ padding: "12px 14px", background: "#FEF2F2" }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: SENTIMENT_COLORS.error, letterSpacing: "0.1em", marginBottom: 6 }}>
                      🐻 BEAR CASE{detail.analystDetail.bearCaseDate ? ` · ${detail.analystDetail.bearCaseDate}` : ""}
                    </div>
                    <div style={{ fontSize: 11, lineHeight: 1.55, color: "#450A0A" }}>{detail.analystDetail.bearCase}</div>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", background: theme.text, color: theme.surface }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: theme.textTertiary, marginBottom: 4 }}>VERDICT: HYPE OR REAL?</div>
                  <div style={{ fontSize: 12, lineHeight: 1.6, fontWeight: 500, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: semaphoreColor, flexShrink: 0, marginTop: 2 }} title="Overall sentiment" />
                    <span>
                      <span style={{ fontWeight: 800, color: semaphoreColor, marginRight: 6 }}>
                        {detail.analystDetail.verdict.split("—")[0].trim()}
                      </span>
                      {detail.analystDetail.verdict.includes("—") ? "— " + detail.analystDetail.verdict.split("—").slice(1).join("—").trim() : ""}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: 20,
                  background: theme.surfaceAlt,
                  borderRadius: 8,
                  border: `1px dashed ${theme.border}`,
                  textAlign: "center",
                  fontSize: 12,
                  color: theme.textMuted,
                }}
              >
                Analyst coverage not yet tracked for this consolidator.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
