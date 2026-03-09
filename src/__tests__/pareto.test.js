import { describe, it, expect } from "vitest";
import { paretoFrontier } from "../lib/pareto.js";

describe("paretoFrontier", () => {
  it("returns empty array for empty input", () => {
    expect(paretoFrontier([])).toEqual([]);
  });

  it("returns empty array for null input", () => {
    expect(paretoFrontier(null)).toEqual([]);
  });

  it("returns single shop", () => {
    const shops = [{ id: "1", distance: 100, rating: 4.5 }];
    expect(paretoFrontier(shops)).toEqual(shops);
  });

  it("returns closest shop when all same rating", () => {
    const shops = [
      { id: "1", distance: 300, rating: 4.0 },
      { id: "2", distance: 100, rating: 4.0 },
      { id: "3", distance: 500, rating: 4.0 },
    ];
    const result = paretoFrontier(shops);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("returns all shops when each farther shop has higher rating", () => {
    const shops = [
      { id: "1", distance: 100, rating: 3.0 },
      { id: "2", distance: 300, rating: 4.0 },
      { id: "3", distance: 500, rating: 4.5 },
    ];
    const result = paretoFrontier(shops);
    expect(result).toHaveLength(3);
    expect(result.map((s) => s.id)).toEqual(["1", "2", "3"]);
  });

  it("excludes dominated shops", () => {
    // shop 2 is dominated by shop 1 (closer AND higher rating)
    const shops = [
      { id: "1", distance: 100, rating: 4.5 },
      { id: "2", distance: 300, rating: 4.0 },
      { id: "3", distance: 500, rating: 4.8 },
    ];
    const result = paretoFrontier(shops);
    expect(result.map((s) => s.id)).toEqual(["1", "3"]);
  });

  it("handles ties in distance (same distance, different rating)", () => {
    const shops = [
      { id: "1", distance: 100, rating: 4.0 },
      { id: "2", distance: 100, rating: 4.5 },
    ];
    const result = paretoFrontier(shops);
    // The first encountered (lower id by sort order) at distance 100 with rating 4.0
    // then 4.5 > 4.0, so both are frontier? No: sorted by distance they're equal.
    // First shop at dist 100 with rating 4.0 → frontier (4.0 > -Inf)
    // Second shop at dist 100 with rating 4.5 → frontier (4.5 > 4.0)
    expect(result).toHaveLength(2);
  });

  it("handles ties in rating (same rating, different distance)", () => {
    const shops = [
      { id: "1", distance: 100, rating: 4.5 },
      { id: "2", distance: 300, rating: 4.5 },
    ];
    const result = paretoFrontier(shops);
    // shop 2 is dominated: not closer AND not higher rating (same)
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});
