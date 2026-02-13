/**
 * INTEGRATION TESTS — useLiveSectors hook
 * Tests data merging logic with mocked fetch.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useLiveSectors } from "../../hooks/useLiveSectors.js";
import { SECTORS } from "../../sectors.js";

describe("useLiveSectors", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns static SECTORS initially while loading", () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useLiveSectors());
    expect(result.current.loading).toBe(true);
    expect(result.current.sectors).toEqual(SECTORS);
    expect(result.current.error).toBeNull();
  });

  it("falls back to static SECTORS on API error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useLiveSectors());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sectors).toEqual(SECTORS);
    expect(result.current.error).toBe("Network error");
  });

  it("falls back to static SECTORS when baseline/ltm missing", async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === "/api/data/") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ files: ["2026-02-13.json"] }),
        });
      }
      // baseline and ltm both fail
      return Promise.resolve({ ok: false });
    });

    const { result } = renderHook(() => useLiveSectors());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sectors).toEqual(SECTORS);
  });

  it("merges live data when all APIs succeed", async () => {
    const mockBaseline = {
      date: "2026-02-03",
      tickers: {
        HUBS: { price: 100 },
      },
    };

    const mockLtmHigh = {
      fetched_at: "2026-02-13T18:00:00",
      tickers: {
        HUBS: { high_price: 200, zero_price: 100, ltm_high_pct: 100 },
      },
    };

    const mockDaily = {
      date: "2026-02-13",
      fetched_at: "2026-02-13T18:00:00",
      tickers: {
        HUBS: { close: 90, prev_close: 95, daily_pct: -5.3 },
      },
    };

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === "/api/data/") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ files: ["baseline.json", "ltm_high.json", "2026-02-13.json"] }),
        });
      }
      if (url.includes("baseline.json")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockBaseline) });
      }
      if (url.includes("ltm_high.json")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockLtmHigh) });
      }
      if (url.includes("2026-02-13.json")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockDaily) });
      }
      return Promise.resolve({ ok: false });
    });

    const { result } = renderHook(() => useLiveSectors());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.dataAsOf).toBe("2026-02-13T18:00:00");
    expect(result.current.sectors).toHaveLength(SECTORS.length);

    // Find CRM sector and check HubSpot was updated
    const crm = result.current.sectors.find((s) => s.id === "crm");
    const hubspot = crm.companies.find((c) => c.ticker === "HUBS");
    // LTM drop: (100-200)/200 * 100 = -50
    expect(hubspot.drop).toBe(-50);
    // Baseline drop: (90-100)/100 * 100 = -10
    expect(hubspot.baselineDrop).toBe(-10);
  });

  it("preserves private companies without modification", async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === "/api/data/") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ files: ["baseline.json", "ltm_high.json"] }),
        });
      }
      if (url.includes("baseline.json")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ date: "2026-02-03", tickers: {} }) });
      }
      if (url.includes("ltm_high.json")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ tickers: {} }) });
      }
      return Promise.resolve({ ok: false });
    });

    const { result } = renderHook(() => useLiveSectors());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Private companies should retain their original drop (null) and have baselineDrop: null
    const crm = result.current.sectors.find((s) => s.id === "crm");
    const pipedrive = crm.companies.find((c) => c.name === "Pipedrive");
    expect(pipedrive.baselineDrop).toBeNull();
  });

  it("computes sector average drops from company data", async () => {
    const mockBaseline = {
      date: "2026-02-03",
      tickers: {
        HUBS: { price: 100 },
        CRM: { price: 200 },
      },
    };

    const mockLtmHigh = {
      tickers: {
        HUBS: { high_price: 200, zero_price: 100 },
        CRM: { high_price: 400, zero_price: 200 },
      },
    };

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === "/api/data/") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ files: ["baseline.json", "ltm_high.json"] }),
        });
      }
      if (url.includes("baseline.json")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockBaseline) });
      }
      if (url.includes("ltm_high.json")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockLtmHigh) });
      }
      return Promise.resolve({ ok: false });
    });

    const { result } = renderHook(() => useLiveSectors());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const crm = result.current.sectors.find((s) => s.id === "crm");
    // HUBS: (100-200)/200 = -50%, CRM(Salesforce): (200-400)/400 = -50%
    // Average should be -50
    expect(crm.avgDrop).toBe(-50);
  });

  it("uses latest daily file by sorting", async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === "/api/data/") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            files: ["2026-02-10.json", "2026-02-13.json", "2026-02-11.json", "baseline.json", "ltm_high.json"],
          }),
        });
      }
      if (url.includes("baseline.json")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ tickers: {} }) });
      }
      if (url.includes("ltm_high.json")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ tickers: {} }) });
      }
      if (url.includes("2026-02-13.json")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ fetched_at: "2026-02-13T18:00:00", tickers: {} }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const { result } = renderHook(() => useLiveSectors());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should use the latest date file
    expect(result.current.dataAsOf).toBe("2026-02-13T18:00:00");
    // Verify it fetched 2026-02-13.json (latest sorted)
    const fetchCalls = global.fetch.mock.calls.map((c) => c[0]);
    expect(fetchCalls).toContain("/api/data/2026-02-13.json");
  });
});
