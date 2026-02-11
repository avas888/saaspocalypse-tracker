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

/**
 * Drop % thresholds for color coding (value -> { bg, text }).
 * Use DROP_THRESHOLDS_CATEGORY for sector rows, DROP_THRESHOLDS_MEMBER for company rows.
 */
export const DROP_THRESHOLDS = {
  severe: { bg: "#FEE2E2", text: "#991B1B" },
  moderate: { bg: "#FEF3C7", text: "#92400E" },
  neutral: { bg: "#F5F5F4", text: "#57534E" },
  positive: { bg: "#D1FAE5", text: "#065F46" },
  strongPositive: { bg: "#A7F3D0", text: "#064E3B" },
};

/** Stronger red, green, yellow for category (sector) rows — highest contrast */
export const DROP_THRESHOLDS_CATEGORY = {
  severe: { bg: "#FCA5A5", text: "#B91C1C" },
  moderate: { bg: "#FCD34D", text: "#B45309" },
  neutral: { bg: "#E7E5E4", text: "#57534E" },
  positive: { bg: "#6EE7B7", text: "#047857" },
  strongPositive: { bg: "#34D399", text: "#065F46" },
};

/** Softer variant for member (company) rows — distinct but nested under category */
export const DROP_THRESHOLDS_MEMBER = {
  severe: { bg: "#FECACA", text: "#991B1B" },
  moderate: { bg: "#FDE68A", text: "#92400E" },
  neutral: { bg: "#F5F5F4", text: "#57534E" },
  positive: { bg: "#A7F3D0", text: "#065F46" },
  strongPositive: { bg: "#6EE7B7", text: "#064E3B" },
};

/** Bar (defensibility) colors */
export const BAR_COLORS = {
  danger: "#EE6677",
  warning: "#CCBB44",
  success: "#228833",
};

/** Header accent */
export const ACCENT = "#EE6677";

/** Get cell bg/text for a % change value (tracker table).
 * @param {number|null} val — % change value
 * @param {'category'|'member'} variant — 'category' for sector rows (stronger), 'member' for company rows (softer)
 */
export function getCellColor(val, variant = "category") {
  const thresholds = variant === "member" ? DROP_THRESHOLDS_MEMBER : DROP_THRESHOLDS_CATEGORY;
  const neutral = { bg: "#FAFAF9", text: "#A8A29E" };
  if (val === null || val === undefined) return neutral;
  if (val <= -3) return thresholds.severe;
  if (val <= -1) return thresholds.moderate;
  if (val < 1) return thresholds.neutral;
  if (val < 3) return thresholds.positive;
  return thresholds.strongPositive;
}
