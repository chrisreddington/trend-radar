import { Point } from "../types";

const CSV_HEADERS = [
  "Label",
  "Description",
  "Category",
  "Likelihood",
  "Relevance",
  "Preparedness",
] as const;

/**
 * Escapes a value for inclusion in a CSV cell.
 * Wraps values containing commas, double quotes, or newlines in double quotes,
 * and escapes any existing double quotes by doubling them.
 */
export function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

/**
 * Converts an array of Points to a CSV string.
 * The output includes a header row followed by one row per point.
 * Columns: Label, Description, Category, Likelihood, Relevance, Preparedness.
 */
export function pointsToCsv(points: Point[]): string {
  const headerRow = CSV_HEADERS.join(",");
  const dataRows = points.map((point) =>
    [
      escapeCsvValue(point.label),
      escapeCsvValue(point.description ?? ""),
      escapeCsvValue(point.category),
      escapeCsvValue(point.likelihood),
      escapeCsvValue(point.relevance),
      escapeCsvValue(point.preparedness),
    ].join(","),
  );
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Generates the default CSV filename with today's date.
 */
export function generateCsvFilename(): string {
  const date = new Date().toISOString().split("T")[0];
  return `trend-radar-${date}.csv`;
}

/**
 * Triggers a browser download of the given points as a CSV file.
 */
export function downloadPointsAsCsv(
  points: Point[],
  filename = generateCsvFilename(),
): void {
  const csv = pointsToCsv(points);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
