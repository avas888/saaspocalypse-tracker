/**
 * Semantic colors for severity, sentiment, drop thresholds, and UI feedback.
 */
export const SEVERITY_COLORS = {
  catastrophic: "#EE6677",
  severe: "#FF7F00",
  moderate: "#CCBB44",
  low: "#228833",
};

export const SENTIMENT_COLORS = {
  success: "#228833",
  warning: "#CCBB44",
  error: "#EE6677",
};

/** Drop % thresholds for color coding (value -> { bg, text }) */
export const DROP_THRESHOLDS = {
  severe: { bg: "#FEE2E2", text: "#991B1B" },
  moderate: { bg: "#FEF3C7", text: "#92400E" },
  neutral: { bg: "#F5F5F4", text: "#57534E" },
  positive: { bg: "#D1FAE5", text: "#065F46" },
  strongPositive: { bg: "#A7F3D0", text: "#064E3B" },
};

/** Bar (defensibility) colors */
export const BAR_COLORS = {
  danger: "#EE6677",
  warning: "#CCBB44",
  success: "#228833",
};

/** Header accent */
export const ACCENT = "#EE6677";

/** Get cell bg/text for a % change value (tracker table) */
export function getCellColor(val) {
  if (val === null || val === undefined) return { bg: "#F5F5F4", text: "#A8A29E" };
  if (val <= -3) return DROP_THRESHOLDS.severe;
  if (val <= -1) return DROP_THRESHOLDS.moderate;
  if (val < 1) return DROP_THRESHOLDS.neutral;
  if (val < 3) return DROP_THRESHOLDS.positive;
  return DROP_THRESHOLDS.strongPositive;
}
