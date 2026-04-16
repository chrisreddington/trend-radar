/**
 * Generates an SVG filename with today's date.
 * @returns A filename in the format `trend-radar-<date>.svg`.
 */
export function generateSvgFilename(): string {
  const date = new Date().toISOString().split("T")[0];
  return `trend-radar-${date}.svg`;
}

/**
 * Resolves CSS custom properties (e.g. `var(--color)`) inside an SVG string
 * by reading their computed values from the document root.
 *
 * Unresolved variables are replaced with `#000000` as a safe fallback.
 *
 * @param svgString - Serialised SVG markup potentially containing `var(...)` references.
 * @returns The SVG markup with all `var(...)` expressions substituted.
 */
export function resolveCssVariables(svgString: string): string {
  const computedStyle = getComputedStyle(document.documentElement);
  return svgString.replaceAll(/var\(([^)]+)\)/g, (match, variableExpression) => {
    const [variableName] = variableExpression.split(",").map((s: string) => s.trim());
    const resolved = computedStyle.getPropertyValue(variableName).trim();
    return resolved || "#000000";
  });
}

/**
 * Serialises an SVG element to a standalone SVG string.
 *
 * The returned string:
 * - Includes the `xmlns` namespace declaration for standalone use.
 * - Has explicit `width` and `height` attributes sourced from the element's
 *   bounding box so that the exported file has predictable dimensions.
 * - Has resolved CSS custom properties so colours render correctly outside
 *   the browser context.
 *
 * @param svgElement - The `<svg>` element to serialise.
 * @returns A UTF-8 SVG string ready for download.
 */
export function serializeSvg(svgElement: SVGSVGElement): string {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  // Preserve explicit dimensions so the SVG is not ambiguously sized
  const { width, height } = svgElement.getBoundingClientRect();
  if (width > 0) clone.setAttribute("width", String(width));
  if (height > 0) clone.setAttribute("height", String(height));

  const serializer = new XMLSerializer();
  const raw = serializer.serializeToString(clone);
  return resolveCssVariables(raw);
}

/**
 * Triggers a browser download of the given `<svg>` element as an `.svg` file.
 *
 * @param svgElement - The `<svg>` element to export.
 * @param filename - Optional filename; defaults to `trend-radar-<date>.svg`.
 */
export function downloadSvg(
  svgElement: SVGSVGElement,
  filename = generateSvgFilename(),
): void {
  const svgString = serializeSvg(svgElement);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
