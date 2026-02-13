import { useState } from "react";
import { Badge, Bar } from "../atoms/index.js";
import PayrollCallout from "./PayrollCallout.jsx";
import ConsolidatorDetailModal from "./ConsolidatorDetailModal.jsx";
import { BAR_COLORS, SENTIMENT_COLORS } from "../atoms/tokens/semantic.js";
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

function dropColor(drop) {
  if (drop == null) return theme.textMuted;
  if (drop <= -40) return SENTIMENT_COLORS.error;
  if (drop <= -20) return "#FF7F00";
  if (drop <= -10) return SENTIMENT_COLORS.warning;
  return SENTIMENT_COLORS.success;
}

function barColorForExposure(val) {
  if (["Extreme", "Very High", "High"].includes(val)) return BAR_COLORS.danger;
  if (["Medium"].includes(val)) return BAR_COLORS.warning;
  return BAR_COLORS.success;
}

function barColorForShield(val) {
  if (["Very High", "High"].includes(val)) return BAR_COLORS.success;
  if (["Medium"].includes(val)) return BAR_COLORS.warning;
  return BAR_COLORS.danger;
}

export default function SectorDetail({ sector, onBack }) {
  const [expandedCo, setExpandedCo] = useState(null);
  const [selectedConsolidator, setSelectedConsolidator] = useState(null);

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 12,
          color: theme.textMuted,
          padding: 0,
          marginBottom: 16,
          fontFamily: "monospace",
        }}
      >
        ← back
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 32 }}>{sector.icon}</span>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{sector.name}</h2>
          <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
            <Badge color={sector.color} bg={sector.color + "15"}>
              {sector.severity}
            </Badge>
            <Badge>{sector.companies.length} companies</Badge>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "monospace", color: dropColor(sector.avgDrop) }}>{sector.avgDrop}%</div>
            <div style={{ fontSize: 9, color: theme.textMuted, marginTop: 2, letterSpacing: "0.05em" }}>from LTM high</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "monospace", color: dropColor(sector.avgBaselineDrop ?? sector.avgDrop) }}>
              {sector.avgBaselineDrop != null ? `${sector.avgBaselineDrop}%` : "—"}
            </div>
            <div style={{ fontSize: 9, color: theme.textMuted, marginTop: 2, letterSpacing: "0.05em" }}>from Feb 3</div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.7, color: theme.textSecondary, fontStyle: "italic", margin: "12px 0 16px" }}>{sector.thesis}</p>

      {sector.id === "payroll" && <PayrollCallout />}

      <div style={{ padding: 14, background: theme.surfaceAlt, borderRadius: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 8 }}>Defensibility Profile</div>
        <Bar label="Seat Pricing Exposure" value={sector.seatExposure} max={100} color={barColorForExposure(sector.seatExposure)} />
        <Bar label="Regulatory Shield" value={sector.regulatoryShield} max={100} color={barColorForShield(sector.regulatoryShield)} />
      </div>

      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 8 }}>Companies ({sector.companies.length})</div>
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "8px 12px",
          marginBottom: 6,
          fontSize: 9,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: theme.textMuted,
          background: theme.surfaceAlt,
          borderRadius: 6,
        }}
      >
        <div style={{ width: 90, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>Company</div>
        <div style={{ width: 52, textAlign: "right" }}>LTM high</div>
        <div style={{ width: 52, textAlign: "right" }}>Feb 3</div>
      </div>
      {sector.companies.map((c, i) => {
        const hasDetail = !!c.analystDetail;
        const hasConsolidatorDetail = !!c.consolidatorDetail;
        const isExpanded = expandedCo === `${sector.id}-${i}`;
        const semaphoreColor = getSemaphoreColor(c.analystDetail);
        const isClickable = hasDetail || hasConsolidatorDetail;
        return (
          <div key={i} style={{ marginBottom: 4 }}>
            <div
              onClick={() => {
                if (hasConsolidatorDetail) setSelectedConsolidator(c);
                else if (hasDetail) setExpandedCo(isExpanded ? null : `${sector.id}-${i}`);
              }}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                background: theme.white,
                border: `1px solid ${isExpanded ? sector.color : theme.border}`,
                borderRadius: isExpanded ? "6px 6px 0 0" : 6,
                alignItems: "flex-start",
                cursor: isClickable ? "pointer" : "default",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ display: "flex", gap: 12, flexShrink: 0, minWidth: 90 }}>
                <div style={{ textAlign: "right", width: 40 }}>
                  {c.drop !== null ? (
                    <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: dropColor(c.drop) }}>{c.drop}%</div>
                  ) : (
                    <Badge>private</Badge>
                  )}
                  {c.status === "public" && <div style={{ fontSize: 7, color: theme.textTertiary }}>LTM</div>}
                </div>
                <div style={{ textAlign: "right", width: 40 }}>
                  {c.baselineDrop != null ? (
                    <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: dropColor(c.baselineDrop) }}>{c.baselineDrop}%</div>
                  ) : c.status === "public" ? (
                    <span style={{ fontSize: 11, color: theme.textMuted }}>—</span>
                  ) : null}
                  {c.status === "public" && <div style={{ fontSize: 7, color: theme.textTertiary }}>Feb 3</div>}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>
                  {c.name}
                  <span style={{ fontSize: 9, color: theme.textTertiary, fontFamily: "monospace", marginLeft: 6 }}>{c.ticker}</span>
                </div>
                <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2, lineHeight: 1.4 }}>{c.note}</div>
              </div>
              {hasConsolidatorDetail && (
                <div style={{ flexShrink: 0, fontSize: 10, color: theme.textTertiary, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: theme.surfaceAlt, color: theme.textMuted, fontWeight: 700, fontFamily: "monospace" }}>LEARN MORE</span>
                  <span>→</span>
                </div>
              )}
              {hasDetail && !hasConsolidatorDetail && (
                <div style={{ flexShrink: 0, fontSize: 10, color: theme.textTertiary, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: semaphoreColor, flexShrink: 0 }} title="Overall sentiment" />
                  <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: theme.surfaceAlt, color: theme.textMuted, fontWeight: 700, fontFamily: "monospace" }}>DEEP DIVE</span>
                  <span style={{ transition: "transform 0.2s", transform: isExpanded ? "rotate(90deg)" : "none" }}>▶</span>
                </div>
              )}
            </div>
            {isExpanded && c.analystDetail && (
              <div
                style={{
                  border: `1px solid ${sector.color}`,
                  borderTop: "none",
                  borderRadius: "0 0 6px 6px",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "10px 14px", background: theme.surface, display: "flex", gap: 16, flexWrap: "wrap", borderBottom: `1px solid ${theme.borderLight}` }}>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: theme.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" }}>Analyst Consensus</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>{c.analystDetail.consensus}</div>
                    {c.analystDetail.consensusDate && <div style={{ fontSize: 9, color: theme.textTertiary, marginTop: 2 }}>As of {c.analystDetail.consensusDate}</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: theme.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" }}>Median Target</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: theme.text, fontFamily: "monospace" }}>{c.analystDetail.targetMedian}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: theme.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" }}>Range</div>
                    <div style={{ fontSize: 12, color: theme.textSecondary, fontFamily: "monospace" }}>{c.analystDetail.targetRange}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: theme.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" }}>Analysts</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>{c.analystDetail.analystCount}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  <div style={{ padding: "12px 14px", background: "#F0FDF4", borderRight: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: SENTIMENT_COLORS.success, letterSpacing: "0.1em", marginBottom: 6 }}>
                      🐂 BULL CASE{c.analystDetail.bullCaseDate ? ` · ${c.analystDetail.bullCaseDate}` : ""}
                    </div>
                    <div style={{ fontSize: 11, lineHeight: 1.55, color: "#14532D" }}>{c.analystDetail.bullCase}</div>
                  </div>
                  <div style={{ padding: "12px 14px", background: "#FEF2F2" }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: SENTIMENT_COLORS.error, letterSpacing: "0.1em", marginBottom: 6 }}>
                      🐻 BEAR CASE{c.analystDetail.bearCaseDate ? ` · ${c.analystDetail.bearCaseDate}` : ""}
                    </div>
                    <div style={{ fontSize: 11, lineHeight: 1.55, color: "#450A0A" }}>{c.analystDetail.bearCase}</div>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", background: theme.text, color: theme.surface }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: theme.textTertiary, marginBottom: 4 }}>VERDICT: HYPE OR REAL?</div>
                  <div style={{ fontSize: 12, lineHeight: 1.6, fontWeight: 500, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: semaphoreColor, flexShrink: 0, marginTop: 2 }} title="Overall sentiment" />
                    <span>
                      <span style={{ fontWeight: 800, color: semaphoreColor, marginRight: 6 }}>{c.analystDetail.verdict.split("—")[0].trim()}</span>
                      {c.analystDetail.verdict.includes("—") ? "— " + c.analystDetail.verdict.split("—").slice(1).join("—").trim() : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {selectedConsolidator?.consolidatorDetail && (
        <ConsolidatorDetailModal
          company={selectedConsolidator}
          sectorColor={sector.color}
          onClose={() => setSelectedConsolidator(null)}
        />
      )}

      <div
        style={{
          marginTop: 16,
          padding: 16,
          background: theme.warning.bg,
          border: `1px solid ${theme.warning.border}`,
          borderRadius: 8,
          borderLeft: `3px solid ${sector.color}`,
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 800, color: theme.warning.text, marginBottom: 4 }}>KEY INSIGHT</div>
        <p style={{ fontSize: 12, lineHeight: 1.6, color: theme.textSecondary, margin: 0 }}>{sector.keyInsight}</p>
      </div>
    </div>
  );
}
