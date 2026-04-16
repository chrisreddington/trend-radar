import { RING_COLORS, PREPAREDNESS_COLORS } from "../colors";
import { Likelihood, Preparedness } from "../../types";

describe("RING_COLORS", () => {
  const likelihoods = Object.values(Likelihood).toReversed();

  it("should have one entry per Likelihood level", () => {
    expect(RING_COLORS).toHaveLength(likelihoods.length);
  });

  it("should have a valid hex fill colour for every entry", () => {
    const hexColour = /^#[\da-f]{6}$/i;
    for (const color of RING_COLORS) {
      expect(color.fill).toMatch(hexColour);
    }
  });

  it("should have a valid hex stroke colour for every entry", () => {
    const hexColour = /^#[\da-f]{6}$/i;
    for (const color of RING_COLORS) {
      expect(color.stroke).toMatch(hexColour);
    }
  });

  it("should have a non-empty label for every entry", () => {
    for (const color of RING_COLORS) {
      expect(typeof color.label).toBe("string");
      expect(color.label.length).toBeGreaterThan(0);
    }
  });

  it("should have a tailwindClass for every entry", () => {
    for (const color of RING_COLORS) {
      expect(typeof color.tailwindClass).toBe("string");
      expect(color.tailwindClass.length).toBeGreaterThan(0);
    }
  });

  it("should have unique fill colours across all entries", () => {
    const fills = RING_COLORS.map((c) => c.fill);
    const uniqueFills = new Set(fills);
    expect(uniqueFills.size).toBe(fills.length);
  });

  it("should have all required properties on every entry", () => {
    for (const color of RING_COLORS) {
      expect(color).toHaveProperty("fill");
      expect(color).toHaveProperty("stroke");
      expect(color).toHaveProperty("label");
      expect(color).toHaveProperty("tailwindClass");
    }
  });
});

describe("PREPAREDNESS_COLORS", () => {
  const preparednessKeys: Array<keyof typeof PREPAREDNESS_COLORS> = [
    "high",
    "moderate",
    "low",
  ];

  it("should have keys for high, moderate, and low preparedness", () => {
    for (const key of preparednessKeys) {
      expect(PREPAREDNESS_COLORS).toHaveProperty(key);
    }
  });

  it("should have a valid hex colour for every preparedness level", () => {
    const hexColour = /^#[\da-f]{6}$/i;
    for (const key of preparednessKeys) {
      expect(PREPAREDNESS_COLORS[key]).toMatch(hexColour);
    }
  });

  it("should have unique colours for each preparedness level", () => {
    const values = Object.values(PREPAREDNESS_COLORS);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });

  it("should use a green-family colour for high preparedness", () => {
    // Green-500 is #22c55e — verify the hue is in the green range
    const hex = PREPAREDNESS_COLORS.high.slice(1);
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    // Green channel should dominate for a 'green' colour
    expect(g).toBeGreaterThan(r);
    expect(g).toBeGreaterThan(b);
  });

  it("should use a red-family colour for low preparedness", () => {
    const hex = PREPAREDNESS_COLORS.low.slice(1);
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    // Red channel should dominate for a 'red' colour
    expect(r).toBeGreaterThan(g);
    expect(r).toBeGreaterThan(b);
  });

  it("should map correctly to Preparedness enum labels", () => {
    // The three keys align with the three Preparedness levels
    const preparednessLevels = Object.values(Preparedness);
    expect(preparednessLevels).toHaveLength(preparednessKeys.length);
  });
});
