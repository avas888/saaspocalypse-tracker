/**
 * UNIT TESTS — Design tokens & getCellColor pure function
 * Bottom of the test pyramid: fast, no DOM, no React.
 */
import { describe, it, expect } from "vitest";
import {
  SEVERITY_COLORS,
  SENTIMENT_COLORS,
  DROP_THRESHOLDS,
  DROP_THRESHOLDS_CATEGORY,
  DROP_THRESHOLDS_MEMBER,
  BAR_COLORS,
  ACCENT,
  getCellColor,
} from "../../atoms/tokens/semantic.js";
import { SECTOR_COLORS } from "../../atoms/tokens/palette.js";
import { theme } from "../../atoms/tokens/theme.js";

// ─── Palette tokens ────────────────────────────────────────────────

describe("SECTOR_COLORS", () => {
  it("defines 9 sector colors", () => {
    const keys = Object.keys(SECTOR_COLORS);
    expect(keys).toHaveLength(9);
    expect(keys).toEqual(
      expect.arrayContaining([
        "crm", "project", "accounting", "payroll",
        "pos", "hotel", "document", "ecommerce", "consolidators",
      ])
    );
  });

  it("all values are hex color strings", () => {
    Object.values(SECTOR_COLORS).forEach((color) => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

// ─── Semantic tokens ───────────────────────────────────────────────

describe("SEVERITY_COLORS", () => {
  it("has catastrophic, severe, moderate, low", () => {
    expect(SEVERITY_COLORS).toHaveProperty("catastrophic");
    expect(SEVERITY_COLORS).toHaveProperty("severe");
    expect(SEVERITY_COLORS).toHaveProperty("moderate");
    expect(SEVERITY_COLORS).toHaveProperty("low");
  });

  it("values are hex colors", () => {
    Object.values(SEVERITY_COLORS).forEach((c) => {
      expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe("SENTIMENT_COLORS", () => {
  it("has success, warning, error", () => {
    expect(SENTIMENT_COLORS).toHaveProperty("success");
    expect(SENTIMENT_COLORS).toHaveProperty("warning");
    expect(SENTIMENT_COLORS).toHaveProperty("error");
  });
});

describe("DROP_THRESHOLDS", () => {
  it("each variant has { bg, text } for all 5 levels", () => {
    [DROP_THRESHOLDS, DROP_THRESHOLDS_CATEGORY, DROP_THRESHOLDS_MEMBER].forEach((t) => {
      ["severe", "moderate", "neutral", "positive", "strongPositive"].forEach((level) => {
        expect(t[level]).toHaveProperty("bg");
        expect(t[level]).toHaveProperty("text");
        expect(t[level].bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(t[level].text).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});

describe("BAR_COLORS", () => {
  it("has danger, warning, success", () => {
    expect(BAR_COLORS).toHaveProperty("danger");
    expect(BAR_COLORS).toHaveProperty("warning");
    expect(BAR_COLORS).toHaveProperty("success");
  });
});

describe("ACCENT", () => {
  it("is a hex color", () => {
    expect(ACCENT).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

// ─── Theme tokens ──────────────────────────────────────────────────

describe("theme", () => {
  it("has primary surface and text tokens", () => {
    expect(theme).toHaveProperty("background");
    expect(theme).toHaveProperty("surface");
    expect(theme).toHaveProperty("border");
    expect(theme).toHaveProperty("text");
    expect(theme).toHaveProperty("textMuted");
    expect(theme).toHaveProperty("white");
  });

  it("has nested chart tokens (month, week, error, warning)", () => {
    expect(theme.month).toHaveProperty("bg");
    expect(theme.month).toHaveProperty("text");
    expect(theme.week).toHaveProperty("bg");
    expect(theme.error).toHaveProperty("bg");
    expect(theme.warning).toHaveProperty("bg");
  });
});

// ─── getCellColor pure function ────────────────────────────────────

describe("getCellColor", () => {
  it("returns neutral for null/undefined", () => {
    const result = getCellColor(null);
    expect(result).toEqual({ bg: "#FAFAF9", text: "#A8A29E" });
    expect(getCellColor(undefined)).toEqual(result);
  });

  it("returns severe (category) for val <= -3", () => {
    expect(getCellColor(-3)).toEqual(DROP_THRESHOLDS_CATEGORY.severe);
    expect(getCellColor(-10)).toEqual(DROP_THRESHOLDS_CATEGORY.severe);
    expect(getCellColor(-100)).toEqual(DROP_THRESHOLDS_CATEGORY.severe);
  });

  it("returns moderate (category) for -3 < val <= -1", () => {
    expect(getCellColor(-1)).toEqual(DROP_THRESHOLDS_CATEGORY.moderate);
    expect(getCellColor(-2.5)).toEqual(DROP_THRESHOLDS_CATEGORY.moderate);
  });

  it("returns neutral (category) for -1 < val < 1", () => {
    expect(getCellColor(0)).toEqual(DROP_THRESHOLDS_CATEGORY.neutral);
    expect(getCellColor(0.5)).toEqual(DROP_THRESHOLDS_CATEGORY.neutral);
    expect(getCellColor(-0.5)).toEqual(DROP_THRESHOLDS_CATEGORY.neutral);
  });

  it("returns positive (category) for 1 <= val < 3", () => {
    expect(getCellColor(1)).toEqual(DROP_THRESHOLDS_CATEGORY.positive);
    expect(getCellColor(2.9)).toEqual(DROP_THRESHOLDS_CATEGORY.positive);
  });

  it("returns strongPositive (category) for val >= 3", () => {
    expect(getCellColor(3)).toEqual(DROP_THRESHOLDS_CATEGORY.strongPositive);
    expect(getCellColor(50)).toEqual(DROP_THRESHOLDS_CATEGORY.strongPositive);
  });

  it("uses member thresholds when variant='member'", () => {
    expect(getCellColor(-5, "member")).toEqual(DROP_THRESHOLDS_MEMBER.severe);
    expect(getCellColor(-2, "member")).toEqual(DROP_THRESHOLDS_MEMBER.moderate);
    expect(getCellColor(0, "member")).toEqual(DROP_THRESHOLDS_MEMBER.neutral);
    expect(getCellColor(2, "member")).toEqual(DROP_THRESHOLDS_MEMBER.positive);
    expect(getCellColor(5, "member")).toEqual(DROP_THRESHOLDS_MEMBER.strongPositive);
  });

  it("defaults to category when no variant specified", () => {
    expect(getCellColor(-5)).toEqual(DROP_THRESHOLDS_CATEGORY.severe);
  });

  it("handles boundary values precisely", () => {
    // -3 is severe (<=)
    expect(getCellColor(-3)).toEqual(DROP_THRESHOLDS_CATEGORY.severe);
    // -2.99 is moderate (> -3 and <= -1)
    expect(getCellColor(-2.99)).toEqual(DROP_THRESHOLDS_CATEGORY.moderate);
    // -1 is moderate (<=)
    expect(getCellColor(-1)).toEqual(DROP_THRESHOLDS_CATEGORY.moderate);
    // -0.99 is neutral (> -1 and < 1)
    expect(getCellColor(-0.99)).toEqual(DROP_THRESHOLDS_CATEGORY.neutral);
    // 0.99 is neutral (< 1)
    expect(getCellColor(0.99)).toEqual(DROP_THRESHOLDS_CATEGORY.neutral);
    // 1 is positive (>= 1 and < 3)
    expect(getCellColor(1)).toEqual(DROP_THRESHOLDS_CATEGORY.positive);
    // 2.99 is positive
    expect(getCellColor(2.99)).toEqual(DROP_THRESHOLDS_CATEGORY.positive);
    // 3 is strongPositive (>= 3)
    expect(getCellColor(3)).toEqual(DROP_THRESHOLDS_CATEGORY.strongPositive);
  });
});
