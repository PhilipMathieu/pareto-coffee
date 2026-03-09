import { describe, it, expect } from "vitest";
import { haversine, walkingMinutes } from "../lib/geo.js";

describe("haversine", () => {
  it("returns 0 for same point", () => {
    expect(haversine(43.6615, -70.2553, 43.6615, -70.2553)).toBe(0);
  });

  it("returns approximate distance for known points", () => {
    // Portland, ME to Old Port (~1km)
    const dist = haversine(43.6615, -70.2553, 43.6567, -70.2483);
    expect(dist).toBeGreaterThan(500);
    expect(dist).toBeLessThan(2000);
  });

  it("is symmetric", () => {
    const d1 = haversine(43.6615, -70.2553, 43.6567, -70.2483);
    const d2 = haversine(43.6567, -70.2483, 43.6615, -70.2553);
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001);
  });

  it("returns roughly 111km per degree of latitude", () => {
    const dist = haversine(0, 0, 1, 0);
    expect(dist).toBeGreaterThan(110000);
    expect(dist).toBeLessThan(112000);
  });
});

describe("walkingMinutes", () => {
  it("returns 0 for 0 distance", () => {
    expect(walkingMinutes(0)).toBe(0);
  });

  it("returns correct minutes for 800m (10 min)", () => {
    expect(walkingMinutes(800)).toBe(10);
  });

  it("rounds properly", () => {
    expect(walkingMinutes(120)).toBe(2); // 120/80 = 1.5 → 2
  });
});
