import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  escapeCsvValue,
  pointsToCsv,
  generateCsvFilename,
  downloadPointsAsCsv,
} from "../csv-export";
import {
  Category,
  Likelihood,
  Relevance,
  Preparedness,
} from "../../types";
import type { Point } from "../../types";

const makePoint = (overrides: Partial<Point> = {}): Point => ({
  id: "1",
  label: "Test Label",
  category: Category.Technological,
  likelihood: Likelihood.Average,
  relevance: Relevance.Moderate,
  preparedness: Preparedness.ModeratelyPrepared,
  x: 0,
  y: 0,
  ...overrides,
});

describe("escapeCsvValue", () => {
  it("returns plain values unchanged", () => {
    expect(escapeCsvValue("hello")).toBe("hello");
    expect(escapeCsvValue("Highly Likely")).toBe("Highly Likely");
  });

  it("wraps values containing commas in double quotes", () => {
    expect(escapeCsvValue("foo,bar")).toBe('"foo,bar"');
  });

  it("wraps values containing double quotes and escapes them", () => {
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""');
  });

  it("wraps values containing newlines in double quotes", () => {
    expect(escapeCsvValue("line1\nline2")).toBe('"line1\nline2"');
    expect(escapeCsvValue("line1\r\nline2")).toBe('"line1\r\nline2"');
  });

  it("handles empty strings", () => {
    expect(escapeCsvValue("")).toBe("");
  });
});

describe("pointsToCsv", () => {
  it("generates a header row", () => {
    const csv = pointsToCsv([]);
    expect(csv).toBe(
      "Label,Description,Category,Likelihood,Relevance,Preparedness",
    );
  });

  it("generates one data row per point", () => {
    const points = [
      makePoint({ id: "1", label: "Alpha" }),
      makePoint({ id: "2", label: "Beta" }),
    ];
    const rows = pointsToCsv(points).split("\n");
    expect(rows).toHaveLength(3); // header + 2 data rows
    expect(rows[1]).toContain("Alpha");
    expect(rows[2]).toContain("Beta");
  });

  it("includes description when present", () => {
    const point = makePoint({ description: "Some rationale" });
    const csv = pointsToCsv([point]);
    expect(csv).toContain("Some rationale");
  });

  it("uses an empty string for missing description", () => {
    const point = makePoint({ description: undefined });
    const csv = pointsToCsv([point]);
    const dataRow = csv.split("\n")[1];
    // Format: Label,,Category,...  — description column is empty
    expect(dataRow).toMatch(/^[^,]+,,/);
  });

  it("escapes commas within field values", () => {
    const point = makePoint({ label: "Foo, Bar" });
    const csv = pointsToCsv([point]);
    expect(csv).toContain('"Foo, Bar"');
  });

  it("includes all expected columns in the correct order", () => {
    const point = makePoint({
      label: "L",
      description: "D",
      category: Category.Economic,
      likelihood: Likelihood.Likely,
      relevance: Relevance.High,
      preparedness: Preparedness.HighlyPrepared,
    });
    const rows = pointsToCsv([point]).split("\n");
    expect(rows[0]).toBe(
      "Label,Description,Category,Likelihood,Relevance,Preparedness",
    );
    expect(rows[1]).toBe(
      `L,D,${Category.Economic},${Likelihood.Likely},${Relevance.High},${Preparedness.HighlyPrepared}`,
    );
  });
});

describe("generateCsvFilename", () => {
  it("returns a filename starting with trend-radar- and ending with .csv", () => {
    const filename = generateCsvFilename();
    expect(filename).toMatch(/^trend-radar-\d{4}-\d{2}-\d{2}\.csv$/);
  });
});

describe("downloadPointsAsCsv", () => {
  let createObjectUrlSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectUrlSpy: ReturnType<typeof vi.spyOn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let clickSpy: ReturnType<typeof vi.fn>;
  let removeSpy: ReturnType<typeof vi.fn>;
  let createdAnchor: HTMLAnchorElement;

  beforeEach(() => {
    createObjectUrlSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:fake-url");
    revokeObjectUrlSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});

    clickSpy = vi.fn();
    removeSpy = vi.fn();

    appendChildSpy = vi
      .spyOn(document.body, "append")
      .mockImplementation((node) => {
        createdAnchor = node as HTMLAnchorElement;
        createdAnchor.click = clickSpy;
        createdAnchor.remove = removeSpy;
      });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a blob URL and triggers a download click", () => {
    downloadPointsAsCsv([makePoint()]);

    expect(createObjectUrlSpy).toHaveBeenCalledOnce();
    expect(appendChildSpy).toHaveBeenCalledOnce();
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(removeSpy).toHaveBeenCalledOnce();
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith("blob:fake-url");
  });

  it("uses the provided filename as the download attribute", () => {
    downloadPointsAsCsv([makePoint()], "custom-name.csv");
    expect(createdAnchor.download).toBe("custom-name.csv");
  });

  it("defaults to a generated filename when none is provided", () => {
    downloadPointsAsCsv([makePoint()]);
    expect(createdAnchor.download).toMatch(/^trend-radar-\d{4}-\d{2}-\d{2}\.csv$/);
  });
});
