/**
 * E2E / APP-LEVEL TESTS — Full App rendering & tab navigation
 * Top of the test pyramid: fewer tests, broader coverage.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../../pages/App.jsx";

// Mock fetch globally to prevent real API calls
beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url) => {
    if (url === "/api/data/") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ files: [] }),
      });
    }
    if (url.includes("private_health.json")) {
      return Promise.resolve({ ok: false });
    }
    return Promise.resolve({ ok: false });
  });
});

describe("App", () => {
  it("renders the full application without crashing", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/SaaSPocalypse\?/)).toBeInTheDocument();
    });
  });

  it("renders header and tab navigation", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/SaaSPocalypse\?/)).toBeInTheDocument();
    });
    // Tab nav should be present
    expect(screen.getByText("📈 Tracker")).toBeInTheDocument();
    expect(screen.getByText("Sectors")).toBeInTheDocument();
    expect(screen.getByText("Framework")).toBeInTheDocument();
  });

  it("defaults to tracker tab", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("📈 Tracker")).toBeInTheDocument();
    });
    // Tracker tab should be active (bold)
    expect(screen.getByText("📈 Tracker").style.fontWeight).toBe("800");
  });

  it("navigates to Sectors tab", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Sectors")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Sectors"));

    await waitFor(() => {
      expect(screen.getByText("Sectors").style.fontWeight).toBe("800");
    });
    // Should show sector list content
    expect(screen.getByText(/Eight SMB SaaS verticals/)).toBeInTheDocument();
  });

  it("navigates to Framework tab", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Framework")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Framework"));

    await waitFor(() => {
      expect(screen.getByText("Framework").style.fontWeight).toBe("800");
    });
    expect(screen.getByText("Pricing Model")).toBeInTheDocument();
    expect(screen.getByText("Regulatory Moat")).toBeInTheDocument();
  });

  it("navigates to Public Cos tab", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Public Cos")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Public Cos"));

    await waitFor(() => {
      expect(screen.getByText("Public Cos").style.fontWeight).toBe("800");
    });
    // Should show companies list with company names
    expect(screen.getByText(/public companies ranked/)).toBeInTheDocument();
  });

  it("navigates to Private Cos tab", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Private Cos")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Private Cos"));

    await waitFor(() => {
      expect(screen.getByText("Private Cos").style.fontWeight).toBe("800");
    });
    expect(screen.getByText(/private SMB SaaS companies/)).toBeInTheDocument();
  });

  it("navigates between tabs preserving state reset", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Sectors")).toBeInTheDocument();
    });

    // Go to sectors
    fireEvent.click(screen.getByText("Sectors"));
    await waitFor(() => {
      expect(screen.getByText("Sectors").style.fontWeight).toBe("800");
    });

    // Then go to framework
    fireEvent.click(screen.getByText("Framework"));
    await waitFor(() => {
      expect(screen.getByText("Framework").style.fontWeight).toBe("800");
    });
    expect(screen.getByText("Pricing Model")).toBeInTheDocument();

    // Then back to sectors
    fireEvent.click(screen.getByText("Sectors"));
    await waitFor(() => {
      expect(screen.getByText("Sectors").style.fontWeight).toBe("800");
    });
    expect(screen.getByText(/Eight SMB SaaS verticals/)).toBeInTheDocument();
  });

  it("renders footer with attribution", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Not financial advice/)).toBeInTheDocument();
    });
  });
});
