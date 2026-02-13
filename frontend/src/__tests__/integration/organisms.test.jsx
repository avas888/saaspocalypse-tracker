/**
 * INTEGRATION TESTS — Organism components
 * TabNav, Header, SectorList, CompaniesList, FrameworkSection, PrivateCompaniesList
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../../organisms/Header.jsx";
import TabNav from "../../organisms/TabNav.jsx";
import SectorList from "../../organisms/SectorList.jsx";
import CompaniesList from "../../organisms/CompaniesList.jsx";
import FrameworkSection from "../../organisms/FrameworkSection.jsx";
import PrivateCompaniesList from "../../organisms/PrivateCompaniesList.jsx";

// ─── Header ────────────────────────────────────────────────────────

describe("Header", () => {
  it("renders the headline", () => {
    render(<Header />);
    expect(screen.getByText(/SaaSPocalypse\?/)).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<Header />);
    expect(screen.getByText(/Not All SMB SaaS Is/)).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<Header />);
    expect(screen.getByText(/\$285B erased/)).toBeInTheDocument();
  });

  it("renders date attribution", () => {
    render(<Header />);
    expect(screen.getByText(/Feb 3, 2026/)).toBeInTheDocument();
  });
});

// ─── TabNav ────────────────────────────────────────────────────────

describe("TabNav", () => {
  const tabs = [
    "📈 Tracker",
    "Sectors",
    "Relevant Sector News",
    "Public Cos",
    "Private Cos",
    "Analysis",
    "Framework",
  ];

  it("renders all 7 tabs", () => {
    render(<TabNav tab="tracker" onTabChange={() => {}} />);
    tabs.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("highlights the active tab with bold font weight", () => {
    render(<TabNav tab="sectors" onTabChange={() => {}} />);
    const sectorsBtn = screen.getByText("Sectors");
    expect(sectorsBtn.style.fontWeight).toBe("800");
  });

  it("non-active tabs have normal weight", () => {
    render(<TabNav tab="tracker" onTabChange={() => {}} />);
    const sectorsBtn = screen.getByText("Sectors");
    expect(sectorsBtn.style.fontWeight).toBe("400");
  });

  it("calls onTabChange with correct tab ID on click", () => {
    const handleChange = vi.fn();
    render(<TabNav tab="tracker" onTabChange={handleChange} />);
    fireEvent.click(screen.getByText("Sectors"));
    expect(handleChange).toHaveBeenCalledWith("sectors");
  });

  it("calls onTabChange for each tab", () => {
    const handleChange = vi.fn();
    render(<TabNav tab="tracker" onTabChange={handleChange} />);

    fireEvent.click(screen.getByText("📈 Tracker"));
    expect(handleChange).toHaveBeenCalledWith("tracker");

    fireEvent.click(screen.getByText("Public Cos"));
    expect(handleChange).toHaveBeenCalledWith("companies");

    fireEvent.click(screen.getByText("Private Cos"));
    expect(handleChange).toHaveBeenCalledWith("private");

    fireEvent.click(screen.getByText("Analysis"));
    expect(handleChange).toHaveBeenCalledWith("analysis");

    fireEvent.click(screen.getByText("Framework"));
    expect(handleChange).toHaveBeenCalledWith("framework");
  });

  it("all tabs are buttons", () => {
    render(<TabNav tab="tracker" onTabChange={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(7);
  });
});

// ─── SectorList ────────────────────────────────────────────────────

describe("SectorList", () => {
  it("renders methodology section", () => {
    render(<SectorList onSelectSector={() => {}} />);
    expect(screen.getByText("Methodology")).toBeInTheDocument();
  });

  it("renders sector cards for all sectors", () => {
    render(<SectorList onSelectSector={() => {}} />);
    // Should render all 9 sector names
    expect(screen.getByText("CRM & Sales")).toBeInTheDocument();
    expect(screen.getByText("Project Management")).toBeInTheDocument();
    expect(screen.getByText("SMB Accounting")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<SectorList onSelectSector={() => {}} />);
    // "LTM high" and "Feb 3" appear in methodology, column headers, AND each card
    // so we use getAllByText to confirm they're rendered
    expect(screen.getAllByText("Sector").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/LTM high/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Feb 3/).length).toBeGreaterThanOrEqual(1);
  });

  it("calls onSelectSector when card is clicked", () => {
    const handleSelect = vi.fn();
    render(<SectorList onSelectSector={handleSelect} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(handleSelect).toHaveBeenCalled();
  });

  it("uses custom sorted order when provided", () => {
    const customOrder = [
      { id: "pos", name: "Restaurant POS", icon: "🍕", severity: "low", avgDrop: -5, color: "#66CCEE", companies: [{ name: "Toast", ticker: "TOST", status: "public", drop: -5 }] },
    ];
    render(<SectorList onSelectSector={() => {}} sorted={customOrder} />);
    expect(screen.getByText("Restaurant POS")).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<SectorList onSelectSector={() => {}} />);
    expect(screen.getByText(/Eight SMB SaaS verticals/)).toBeInTheDocument();
  });
});

// ─── CompaniesList ─────────────────────────────────────────────────

describe("CompaniesList", () => {
  const publicCos = [
    { name: "HubSpot", ticker: "HUBS", drop: -51, status: "public", region: "US", sectorName: "CRM & Sales", sectorColor: "#EE6677", sectorIcon: "📊", sectorShortName: "CRM" },
    { name: "Asana", ticker: "ASAN", drop: -59, status: "public", region: "US", sectorName: "Project Management", sectorColor: "#4477AA", sectorIcon: "📋", sectorShortName: "Project" },
    { name: "Xero", ticker: "XRO.AX", drop: -12, status: "public", region: "ANZ", sectorName: "SMB Accounting", sectorColor: "#CCBB44", sectorIcon: "🧾", sectorShortName: "Accounting" },
  ];

  it("renders company count", () => {
    render(<CompaniesList publicCos={publicCos} />);
    expect(screen.getByText(/3 public companies/)).toBeInTheDocument();
  });

  it("renders all company names", () => {
    render(<CompaniesList publicCos={publicCos} />);
    expect(screen.getByText("HubSpot")).toBeInTheDocument();
    expect(screen.getByText("Asana")).toBeInTheDocument();
    expect(screen.getByText("Xero")).toBeInTheDocument();
  });

  it("renders drop percentages", () => {
    render(<CompaniesList publicCos={publicCos} />);
    expect(screen.getByText("-51%")).toBeInTheDocument();
    expect(screen.getByText("-59%")).toBeInTheDocument();
    expect(screen.getByText("-12%")).toBeInTheDocument();
  });

  it("renders sort buttons", () => {
    render(<CompaniesList publicCos={publicCos} />);
    // Sort buttons and column headers share text; confirm multiple exist
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(3); // 3 sort buttons
    expect(buttons[0].textContent).toContain("% change");
    expect(buttons[1].textContent).toContain("Sector");
    expect(buttons[2].textContent).toContain("Region");
  });

  it("renders column headers", () => {
    render(<CompaniesList publicCos={publicCos} />);
    // Column headers
    const headers = screen.getAllByText("Region");
    expect(headers.length).toBeGreaterThanOrEqual(1);
  });

  it("toggles sort direction on repeated click", () => {
    render(<CompaniesList publicCos={publicCos} />);
    const buttons = screen.getAllByRole("button");
    const sectorBtn = buttons[1]; // Second button is "Sector"
    fireEvent.click(sectorBtn);
    // First click switches to sector sort asc
    expect(sectorBtn.textContent).toContain("↑");
    // Second click toggles direction
    fireEvent.click(sectorBtn);
    expect(sectorBtn.textContent).toContain("↓");
  });

  it("renders regions for each company", () => {
    render(<CompaniesList publicCos={publicCos} />);
    const usTexts = screen.getAllByText("US");
    expect(usTexts.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("ANZ")).toBeInTheDocument();
  });

  it("renders spread text", () => {
    render(<CompaniesList publicCos={publicCos} />);
    expect(screen.getByText(/The spread from/)).toBeInTheDocument();
  });

  it("handles empty array gracefully", () => {
    const { container } = render(<CompaniesList publicCos={[]} />);
    expect(screen.getByText(/0 public companies/)).toBeInTheDocument();
  });
});

// ─── FrameworkSection ──────────────────────────────────────────────

describe("FrameworkSection", () => {
  it("renders all 5 factors", () => {
    render(<FrameworkSection />);
    expect(screen.getByText("Pricing Model")).toBeInTheDocument();
    expect(screen.getByText("Regulatory Moat")).toBeInTheDocument();
    expect(screen.getByText("Data Uniqueness")).toBeInTheDocument();
    expect(screen.getByText("AI Relationship")).toBeInTheDocument();
    expect(screen.getByText("Ownership")).toBeInTheDocument();
  });

  it("renders red (risk) and green (safe) descriptions for each factor", () => {
    render(<FrameworkSection />);
    // "Per-seat" appears in both the factors table and the tiers section
    expect(screen.getAllByText(/Per-seat/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Per-outcome/)).toBeInTheDocument();
    expect(screen.getByText(/Country-specific tax/)).toBeInTheDocument();
  });

  it("renders three tiers section", () => {
    render(<FrameworkSection />);
    expect(screen.getByText(/Three tiers of SMB SaaS/)).toBeInTheDocument();
    expect(screen.getByText(/Structurally threatened/)).toBeInTheDocument();
    expect(screen.getByText(/Collateral damage/)).toBeInTheDocument();
    expect(screen.getByText(/AI beneficiaries mislabeled/)).toBeInTheDocument();
  });

  it("renders description paragraph", () => {
    render(<FrameworkSection />);
    expect(screen.getByText(/Five factors predict/)).toBeInTheDocument();
  });
});

// ─── PrivateCompaniesList ──────────────────────────────────────────

describe("PrivateCompaniesList", () => {
  beforeEach(() => {
    // Mock fetch for private_health.json
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => null,
    });
  });

  const privateCos = [
    { name: "Pipedrive", status: "private", region: "Europe", sectorName: "CRM & Sales", sectorIcon: "📊", sectorShortName: "CRM", sectorColor: "#EE6677" },
    { name: "ClickUp", status: "private", region: "US", sectorName: "Project Management", sectorIcon: "📋", sectorShortName: "Project", sectorColor: "#4477AA" },
  ];

  it("renders company count", () => {
    render(<PrivateCompaniesList privateCos={privateCos} />);
    expect(screen.getByText(/2 private SMB SaaS companies/)).toBeInTheDocument();
  });

  it("renders all company names", () => {
    render(<PrivateCompaniesList privateCos={privateCos} />);
    expect(screen.getByText("Pipedrive")).toBeInTheDocument();
    expect(screen.getByText("ClickUp")).toBeInTheDocument();
  });

  it("renders sort buttons for sector and region", () => {
    render(<PrivateCompaniesList privateCos={privateCos} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2); // Sector and Region sort buttons
    expect(buttons[0].textContent).toContain("Sector");
    expect(buttons[1].textContent).toContain("Region");
  });

  it("renders key observation text", () => {
    render(<PrivateCompaniesList privateCos={privateCos} />);
    expect(screen.getByText(/Key observation/)).toBeInTheDocument();
  });

  it("handles empty array", () => {
    render(<PrivateCompaniesList privateCos={[]} />);
    expect(screen.getByText(/0 private SMB SaaS companies/)).toBeInTheDocument();
  });
});
