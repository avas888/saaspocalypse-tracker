/**
 * INTEGRATION TESTS — Molecule components (SectorCard, ChartTooltip, CompanyRow)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SectorCard from "../../molecules/SectorCard.jsx";
import ChartTooltip from "../../molecules/ChartTooltip.jsx";
import CompanyRow from "../../molecules/CompanyRow.jsx";

// ─── Test fixtures ─────────────────────────────────────────────────

const makeSector = (overrides = {}) => ({
  id: "crm",
  name: "CRM & Sales",
  icon: "📊",
  severity: "catastrophic",
  avgDrop: -42,
  avgBaselineDrop: -5,
  color: "#EE6677",
  companies: [
    { name: "HubSpot", ticker: "HUBS", drop: -51, status: "public", region: "US" },
    { name: "Pipedrive", ticker: "private", drop: null, status: "private", region: "Europe" },
  ],
  ...overrides,
});

// ─── SectorCard ────────────────────────────────────────────────────

describe("SectorCard", () => {
  it("renders sector name", () => {
    render(<SectorCard sector={makeSector()} onClick={() => {}} />);
    expect(screen.getByText("CRM & Sales")).toBeInTheDocument();
  });

  it("renders sector icon", () => {
    render(<SectorCard sector={makeSector()} onClick={() => {}} />);
    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("renders severity label", () => {
    render(<SectorCard sector={makeSector()} onClick={() => {}} />);
    expect(screen.getByText("catastrophic")).toBeInTheDocument();
  });

  it("renders LTM high drop percentage", () => {
    render(<SectorCard sector={makeSector()} onClick={() => {}} />);
    expect(screen.getByText("-42%")).toBeInTheDocument();
  });

  it("renders baseline drop when present", () => {
    render(<SectorCard sector={makeSector({ avgBaselineDrop: -5 })} onClick={() => {}} />);
    expect(screen.getByText("-5%")).toBeInTheDocument();
  });

  it("renders dash when avgBaselineDrop is null", () => {
    render(<SectorCard sector={makeSector({ avgBaselineDrop: null })} onClick={() => {}} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("displays company count and private count", () => {
    render(<SectorCard sector={makeSector()} onClick={() => {}} />);
    expect(screen.getByText(/2 companies tracked/)).toBeInTheDocument();
    expect(screen.getByText(/1 private/)).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<SectorCard sector={makeSector()} onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders as a button element", () => {
    render(<SectorCard sector={makeSector()} onClick={() => {}} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders arrow indicator", () => {
    render(<SectorCard sector={makeSector()} onClick={() => {}} />);
    expect(screen.getByText("→")).toBeInTheDocument();
  });
});

// ─── ChartTooltip ──────────────────────────────────────────────────

describe("ChartTooltip", () => {
  const payload = [
    { dataKey: "crm", name: "CRM", value: -42, color: "#EE6677" },
    { dataKey: "pos", name: "POS", value: -10, color: "#66CCEE" },
    { dataKey: "hotel", name: "Hotel", value: -15, color: "#AA3377" },
  ];

  it("renders nothing when inactive", () => {
    const { container } = render(
      <ChartTooltip active={false} payload={payload} label="Feb 3" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when payload is empty", () => {
    const { container } = render(
      <ChartTooltip active={true} payload={[]} label="Feb 3" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when payload is null", () => {
    const { container } = render(
      <ChartTooltip active={true} payload={null} label="Feb 3" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders label when active with payload", () => {
    render(<ChartTooltip active={true} payload={payload} label="Feb 3" />);
    expect(screen.getByText("Feb 3")).toBeInTheDocument();
  });

  it("renders all payload entries", () => {
    render(<ChartTooltip active={true} payload={payload} label="Feb 3" />);
    expect(screen.getByText(/CRM/)).toBeInTheDocument();
    expect(screen.getByText(/POS/)).toBeInTheDocument();
    expect(screen.getByText(/Hotel/)).toBeInTheDocument();
  });

  it("sorts payload ascending by default", () => {
    const { container } = render(
      <ChartTooltip active={true} payload={payload} label="Feb 3" />
    );
    const entries = container.querySelectorAll("div > div");
    const texts = Array.from(entries).map((e) => e.textContent).filter((t) => t.includes(":"));
    // CRM (-42) should come first (most negative), POS (-10) last
    expect(texts[0]).toContain("CRM");
    expect(texts[texts.length - 1]).toContain("POS");
  });

  it("sorts descending when sortDesc=true", () => {
    const { container } = render(
      <ChartTooltip active={true} payload={payload} label="Feb 3" sortDesc={true} />
    );
    const entries = container.querySelectorAll("div > div");
    const texts = Array.from(entries).map((e) => e.textContent).filter((t) => t.includes(":"));
    // POS (-10) should come first (highest), CRM (-42) last
    expect(texts[0]).toContain("POS");
    expect(texts[texts.length - 1]).toContain("CRM");
  });

  it("applies custom formatter", () => {
    const formatter = (v) => `${v}%`;
    render(
      <ChartTooltip active={true} payload={payload} label="Feb 3" formatter={formatter} />
    );
    expect(screen.getByText(/CRM: -42%/)).toBeInTheDocument();
  });

  it("handles null values in payload during sort", () => {
    const mixedPayload = [
      { dataKey: "a", name: "A", value: null, color: "#000" },
      { dataKey: "b", name: "B", value: -5, color: "#111" },
      { dataKey: "c", name: "C", value: null, color: "#222" },
    ];
    const { container } = render(
      <ChartTooltip active={true} payload={mixedPayload} label="Test" />
    );
    // Should not throw - null values go to the end
    expect(container.firstChild).not.toBeNull();
  });
});

// ─── CompanyRow ────────────────────────────────────────────────────

describe("CompanyRow", () => {
  const company = { name: "HubSpot", ticker: "HUBS" };
  const baseline = { HUBS: 100 };
  const columns = [
    {
      type: "day",
      label: "Feb 4",
      data: [{ tickers: { HUBS: { close: 97 } } }],
    },
    {
      type: "day",
      label: "Feb 5",
      data: [{ tickers: { HUBS: { close: 95 } } }],
    },
  ];
  const ltmHighData = {
    tickers: { HUBS: { ltm_high_pct: 89 } },
  };

  it("renders company name and ticker", () => {
    const { container } = render(
      <table>
        <tbody>
          <CompanyRow
            company={company}
            columns={columns}
            baseline={baseline}
            ltmHighData={ltmHighData}
          />
        </tbody>
      </table>
    );
    expect(screen.getByText("HubSpot")).toBeInTheDocument();
    expect(screen.getByText("HUBS")).toBeInTheDocument();
  });

  it("calculates period-over-period % change", () => {
    const { container } = render(
      <table>
        <tbody>
          <CompanyRow
            company={company}
            columns={columns}
            baseline={baseline}
            ltmHighData={ltmHighData}
          />
        </tbody>
      </table>
    );
    // First column: (97-100)/100 = -3%
    expect(screen.getByText("-3.0%")).toBeInTheDocument();
    // Second column: (95-97)/97 = -2.06%
    expect(screen.getByText("-2.1%")).toBeInTheDocument();
  });

  it("calculates cumulative % from baseline", () => {
    const { container } = render(
      <table>
        <tbody>
          <CompanyRow
            company={company}
            columns={columns}
            baseline={baseline}
            ltmHighData={ltmHighData}
          />
        </tbody>
      </table>
    );
    // Cumulative: (95-100)/100 = -5%
    expect(screen.getByText("-5.0%")).toBeInTheDocument();
  });

  it("renders dash for missing data", () => {
    const emptyColumns = [
      { type: "day", label: "Feb 4", data: [{ tickers: {} }] },
    ];
    const { container } = render(
      <table>
        <tbody>
          <CompanyRow
            company={company}
            columns={emptyColumns}
            baseline={baseline}
            ltmHighData={ltmHighData}
          />
        </tbody>
      </table>
    );
    // Should show dashes for missing data
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'Learn more' when isClickable", () => {
    render(
      <table>
        <tbody>
          <CompanyRow
            company={company}
            columns={columns}
            baseline={baseline}
            ltmHighData={ltmHighData}
            isClickable={true}
            onClick={() => {}}
          />
        </tbody>
      </table>
    );
    expect(screen.getByText(/Learn more/)).toBeInTheDocument();
  });

  it("calls onClick when clickable and clicked", () => {
    const handleClick = vi.fn();
    render(
      <table>
        <tbody>
          <CompanyRow
            company={company}
            columns={columns}
            baseline={baseline}
            ltmHighData={ltmHighData}
            isClickable={true}
            onClick={handleClick}
          />
        </tbody>
      </table>
    );
    const row = screen.getByText("HubSpot").closest("tr");
    fireEvent.click(row);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when not clickable", () => {
    const handleClick = vi.fn();
    render(
      <table>
        <tbody>
          <CompanyRow
            company={company}
            columns={columns}
            baseline={baseline}
            ltmHighData={ltmHighData}
            isClickable={false}
            onClick={handleClick}
          />
        </tbody>
      </table>
    );
    const row = screen.getByText("HubSpot").closest("tr");
    fireEvent.click(row);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
