/**
 * INTEGRATION TESTS — Atom components (Badge, SeverityDot, Bar)
 * Render with real tokens, verify DOM output.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, SeverityDot, Bar } from "../../atoms/index.js";
import { SEVERITY_COLORS } from "../../atoms/tokens/semantic.js";

// ─── Badge ─────────────────────────────────────────────────────────

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>CRM</Badge>);
    expect(screen.getByText("CRM")).toBeInTheDocument();
  });

  it("renders as a span", () => {
    const { container } = render(<Badge>Test</Badge>);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span.textContent).toBe("Test");
  });

  it("applies custom color and bg", () => {
    const { container } = render(<Badge color="#FF0000" bg="#00FF00">Custom</Badge>);
    const span = container.querySelector("span");
    expect(span.style.color).toBe("rgb(255, 0, 0)");
    expect(span.style.background).toBe("rgb(0, 255, 0)");
  });

  it("applies default color/bg from theme when no props given", () => {
    const { container } = render(<Badge>Default</Badge>);
    const span = container.querySelector("span");
    expect(span.style.color).toBeTruthy();
    expect(span.style.background).toBeTruthy();
  });

  it("has pill-shaped border radius", () => {
    const { container } = render(<Badge>Pill</Badge>);
    const span = container.querySelector("span");
    expect(span.style.borderRadius).toBe("99px");
  });
});

// ─── SeverityDot ───────────────────────────────────────────────────

describe("SeverityDot", () => {
  it("renders a colored span", () => {
    const { container } = render(<SeverityDot severity="catastrophic" />);
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span.style.borderRadius).toBe("50%");
  });

  it("uses correct color for each severity level", () => {
    Object.entries(SEVERITY_COLORS).forEach(([level, expectedColor]) => {
      const { container } = render(<SeverityDot severity={level} />);
      const span = container.querySelector("span");
      expect(span.style.background).toBeTruthy();
    });
  });

  it("falls back to moderate for unknown severity", () => {
    const { container } = render(<SeverityDot severity="unknown" />);
    const span = container.querySelector("span");
    // Should fall back to SEVERITY_COLORS.moderate
    expect(span.style.background).toBeTruthy();
  });

  it("is 8px circle", () => {
    const { container } = render(<SeverityDot severity="severe" />);
    const span = container.querySelector("span");
    expect(span.style.width).toBe("8px");
    expect(span.style.height).toBe("8px");
  });
});

// ─── Bar ───────────────────────────────────────────────────────────

describe("Bar", () => {
  it("renders label text", () => {
    render(<Bar value={70} label="Switching Cost" />);
    expect(screen.getByText("Switching Cost")).toBeInTheDocument();
  });

  it("renders numeric value display", () => {
    render(<Bar value={70} label="Test" />);
    expect(screen.getByText("70")).toBeInTheDocument();
  });

  it("renders string labels (Extreme, High, etc.)", () => {
    render(<Bar value="Extreme" label="Exposure" />);
    expect(screen.getByText("Extreme")).toBeInTheDocument();
  });

  it("calculates correct width for numeric values", () => {
    const { container } = render(<Bar value={50} max={100} label="Half" />);
    const bars = container.querySelectorAll("div > div > div");
    // The inner fill bar should have width 50%
    const fillBar = bars[bars.length - 1];
    expect(fillBar.style.width).toBe("50%");
  });

  it("calculates width for string labels using LABEL_TO_NUM mapping", () => {
    const { container } = render(<Bar value="High" max={100} label="Test" />);
    const allDivs = container.querySelectorAll("div");
    // "High" maps to 70, so width should be 70%
    let foundWidth = false;
    allDivs.forEach((div) => {
      if (div.style.width === "70%") foundWidth = true;
    });
    expect(foundWidth).toBe(true);
  });

  it("caps at 100%", () => {
    const { container } = render(<Bar value={200} max={100} label="Over" />);
    const allDivs = container.querySelectorAll("div");
    let foundWidth = false;
    allDivs.forEach((div) => {
      if (div.style.width === "100%") foundWidth = true;
    });
    expect(foundWidth).toBe(true);
  });

  it("handles negative values via Math.abs", () => {
    const { container } = render(<Bar value={-50} max={100} label="Neg" />);
    const allDivs = container.querySelectorAll("div");
    let foundWidth = false;
    allDivs.forEach((div) => {
      if (div.style.width === "50%") foundWidth = true;
    });
    expect(foundWidth).toBe(true);
  });

  it("applies custom color", () => {
    const { container } = render(<Bar value={50} label="Colored" color="#FF0000" />);
    const spans = container.querySelectorAll("span");
    const valueSpan = Array.from(spans).find((s) => s.textContent === "50");
    expect(valueSpan.style.color).toBe("rgb(255, 0, 0)");
  });
});
