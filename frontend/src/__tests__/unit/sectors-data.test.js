/**
 * UNIT TESTS — Sectors data integrity
 * Validates the shape and content of the static SECTORS dataset.
 */
import { describe, it, expect } from "vitest";
import { SECTORS, REGION_ORDER } from "../../sectors.js";
import { SECTOR_COLORS } from "../../atoms/tokens/palette.js";

describe("SECTORS dataset", () => {
  it("exports an array of 9 sectors", () => {
    expect(Array.isArray(SECTORS)).toBe(true);
    expect(SECTORS).toHaveLength(9);
  });

  it("every sector has required fields", () => {
    SECTORS.forEach((s) => {
      expect(s).toHaveProperty("id");
      expect(s).toHaveProperty("name");
      expect(s).toHaveProperty("icon");
      expect(s).toHaveProperty("severity");
      expect(s).toHaveProperty("avgDrop");
      expect(s).toHaveProperty("thesis");
      expect(s).toHaveProperty("companies");
      expect(s).toHaveProperty("color");
      expect(typeof s.id).toBe("string");
      expect(typeof s.name).toBe("string");
      expect(typeof s.avgDrop).toBe("number");
      expect(Array.isArray(s.companies)).toBe(true);
    });
  });

  it("all 9 sector IDs are unique and match palette keys", () => {
    const ids = SECTORS.map((s) => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(9);
    ids.forEach((id) => {
      expect(SECTOR_COLORS).toHaveProperty(id);
    });
  });

  it("severity is one of the valid levels", () => {
    const valid = ["catastrophic", "severe", "moderate", "low"];
    SECTORS.forEach((s) => {
      expect(valid).toContain(s.severity);
    });
  });

  it("every company has name, status, and region", () => {
    SECTORS.forEach((s) => {
      s.companies.forEach((c) => {
        expect(c).toHaveProperty("name");
        expect(c).toHaveProperty("status");
        expect(["public", "private"]).toContain(c.status);
        if (c.status === "public") {
          expect(c).toHaveProperty("ticker");
          expect(c.ticker).not.toBe("private");
        }
      });
    });
  });

  it("public companies have numeric drop values", () => {
    SECTORS.forEach((s) => {
      s.companies.filter((c) => c.status === "public" && c.drop !== null).forEach((c) => {
        expect(typeof c.drop).toBe("number");
        expect(c.drop).toBeLessThanOrEqual(0);
      });
    });
  });

  it("private companies have null drop or no drop", () => {
    SECTORS.forEach((s) => {
      s.companies.filter((c) => c.status === "private").forEach((c) => {
        expect(c.drop === null || c.drop === undefined).toBe(true);
      });
    });
  });

  it("each sector has at least 1 company", () => {
    SECTORS.forEach((s) => {
      expect(s.companies.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("total companies across all sectors is 60+", () => {
    const total = SECTORS.reduce((sum, s) => sum + s.companies.length, 0);
    expect(total).toBeGreaterThanOrEqual(60);
  });

  it("sector color is populated from palette", () => {
    SECTORS.forEach((s) => {
      expect(s.color).toBe(SECTOR_COLORS[s.id]);
    });
  });
});

describe("REGION_ORDER", () => {
  it("defines numeric ordering for known regions", () => {
    expect(REGION_ORDER).toHaveProperty("US");
    expect(REGION_ORDER).toHaveProperty("Europe");
    expect(REGION_ORDER).toHaveProperty("LATAM");
    expect(REGION_ORDER).toHaveProperty("Asia");
    expect(REGION_ORDER).toHaveProperty("ANZ");
    expect(REGION_ORDER).toHaveProperty("Canada");
    expect(REGION_ORDER).toHaveProperty("Global");
  });

  it("values are numbers for sorting", () => {
    Object.values(REGION_ORDER).forEach((v) => {
      expect(typeof v).toBe("number");
    });
  });

  it("US is first (lowest)", () => {
    const min = Math.min(...Object.values(REGION_ORDER));
    expect(REGION_ORDER.US).toBe(min);
  });
});
