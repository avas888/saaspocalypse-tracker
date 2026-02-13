/**
 * INTEGRATION TESTS — MainLayout template
 * Tests layout rendering, header, tab nav, footer, and formatDataAsOf.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MainLayout from "../../templates/MainLayout.jsx";

describe("MainLayout", () => {
  it("renders Header component", () => {
    render(
      <MainLayout tab="tracker" onTabChange={() => {}}>
        <div>Content</div>
      </MainLayout>
    );
    // Header contains the headline
    expect(screen.getByText(/SaaSPocalypse\?/)).toBeInTheDocument();
  });

  it("renders TabNav with correct active tab", () => {
    render(
      <MainLayout tab="sectors" onTabChange={() => {}}>
        <div>Content</div>
      </MainLayout>
    );
    // "Sectors" tab should be rendered
    expect(screen.getByText("Sectors")).toBeInTheDocument();
    // Active tab should have bold weight
    expect(screen.getByText("Sectors").style.fontWeight).toBe("800");
  });

  it("renders children content", () => {
    render(
      <MainLayout tab="tracker" onTabChange={() => {}}>
        <div>My Test Content</div>
      </MainLayout>
    );
    expect(screen.getByText("My Test Content")).toBeInTheDocument();
  });

  it("renders footer with data source attribution", () => {
    render(
      <MainLayout tab="tracker" onTabChange={() => {}}>
        <div>Content</div>
      </MainLayout>
    );
    expect(screen.getByText(/Not financial advice/)).toBeInTheDocument();
    expect(screen.getByText(/Sources:/)).toBeInTheDocument();
  });

  it("formats ISO date in footer when dataAsOf is provided", () => {
    render(
      <MainLayout tab="tracker" onTabChange={() => {}} dataAsOf="2026-02-13T18:00:00">
        <div>Content</div>
      </MainLayout>
    );
    expect(screen.getByText(/Feb 13, 2026/)).toBeInTheDocument();
  });

  it("shows default date when dataAsOf is null", () => {
    render(
      <MainLayout tab="tracker" onTabChange={() => {}} dataAsOf={null}>
        <div>Content</div>
      </MainLayout>
    );
    // "Feb 3, 2026" appears in both header and footer — confirm at least 2 instances
    const matches = screen.getAllByText(/Feb 3, 2026/);
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it("shows default date for invalid ISO string", () => {
    render(
      <MainLayout tab="tracker" onTabChange={() => {}} dataAsOf="">
        <div>Content</div>
      </MainLayout>
    );
    // Empty string -> formatDataAsOf returns "Feb 3, 2026"; appears in header too
    const matches = screen.getAllByText(/Feb 3, 2026/);
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it("passes onTabChange through to TabNav", () => {
    const handleChange = vi.fn();
    render(
      <MainLayout tab="tracker" onTabChange={handleChange}>
        <div>Content</div>
      </MainLayout>
    );
    fireEvent.click(screen.getByText("Sectors"));
    expect(handleChange).toHaveBeenCalledWith("sectors");
  });

  it("uses wider max-width for tracker tab", () => {
    const { container } = render(
      <MainLayout tab="tracker" onTabChange={() => {}}>
        <div data-testid="content">Content</div>
      </MainLayout>
    );
    const contentWrapper = screen.getByTestId("content").parentElement;
    expect(contentWrapper.style.maxWidth).toBe("1000px");
  });

  it("uses narrower max-width for non-tracker tabs", () => {
    const { container } = render(
      <MainLayout tab="sectors" onTabChange={() => {}}>
        <div data-testid="content">Content</div>
      </MainLayout>
    );
    const contentWrapper = screen.getByTestId("content").parentElement;
    expect(contentWrapper.style.maxWidth).toBe("700px");
  });
});
