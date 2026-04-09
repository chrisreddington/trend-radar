import {
  generateSvgFilename,
  resolveCssVariables,
  serializeSvg,
  downloadSvg,
} from "../svg-export";
import { vi } from "vitest";

describe("generateSvgFilename", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should generate a filename containing the current date", () => {
    expect(generateSvgFilename()).toBe("trend-radar-2025-06-15.svg");
  });

  it("should always end with the .svg extension", () => {
    expect(generateSvgFilename()).toMatch(/\.svg$/);
  });
});

describe("resolveCssVariables", () => {
  let originalGetComputedStyle: typeof globalThis.getComputedStyle;

  beforeEach(() => {
    originalGetComputedStyle = globalThis.getComputedStyle;
  });

  afterEach(() => {
    globalThis.getComputedStyle = originalGetComputedStyle;
  });

  it("should replace a known CSS variable with its computed value", () => {
    vi.spyOn(globalThis, "getComputedStyle").mockReturnValue({
      getPropertyValue: (name: string) =>
        name === "--primary" ? "#ff0000" : "",
    } as unknown as CSSStyleDeclaration);

    const result = resolveCssVariables('stroke="var(--primary)"');
    expect(result).toBe('stroke="#ff0000"');
  });

  it("should fall back to #000000 for an unresolved variable", () => {
    vi.spyOn(globalThis, "getComputedStyle").mockReturnValue({
      getPropertyValue: () => "",
    } as unknown as CSSStyleDeclaration);

    const result = resolveCssVariables('fill="var(--unknown-var)"');
    expect(result).toBe('fill="#000000"');
  });

  it("should replace multiple CSS variable references in one pass", () => {
    vi.spyOn(globalThis, "getComputedStyle").mockReturnValue({
      getPropertyValue: (name: string) => {
        if (name === "--a") return "#111111";
        if (name === "--b") return "#222222";
        return "";
      },
    } as unknown as CSSStyleDeclaration);

    const result = resolveCssVariables(
      'fill="var(--a)" stroke="var(--b)"',
    );
    expect(result).toBe('fill="#111111" stroke="#222222"');
  });

  it("should leave strings without var() expressions unchanged", () => {
    vi.spyOn(globalThis, "getComputedStyle").mockReturnValue({
      getPropertyValue: () => "",
    } as unknown as CSSStyleDeclaration);

    const original = '<circle fill="#3b82f6" />';
    expect(resolveCssVariables(original)).toBe(original);
  });
});

/**
 * Creates a minimal SVG element with a deterministic bounding box for testing.
 */
function makeSvgElement(
  boundingBoxWidth = 200,
  boundingBoxHeight = 200,
): SVGSVGElement {
  const svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  ) as SVGSVGElement;
  svg.getBoundingClientRect = vi.fn().mockReturnValue({
    width: boundingBoxWidth,
    height: boundingBoxHeight,
  });
  document.body.append(svg);
  return svg;
}

describe("serializeSvg", () => {
  afterEach(() => {
    // Clean up any SVG elements appended during tests
    for (const svg of document.querySelectorAll("svg")) svg.remove();
  });

  it("should include the SVG xmlns attribute", () => {
    const svg = makeSvgElement();
    const result = serializeSvg(svg);
    expect(result).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("should include width and height from getBoundingClientRect", () => {
    const svg = makeSvgElement(400, 300);
    const result = serializeSvg(svg);
    expect(result).toContain('width="400"');
    expect(result).toContain('height="300"');
  });

  it("should omit width when bounding rect is zero", () => {
    const svg = makeSvgElement(0, 0);
    const result = serializeSvg(svg);
    expect(result).not.toMatch(/width="\d/);
    expect(result).not.toMatch(/height="\d/);
  });

  it("should not modify the original SVG element", () => {
    const svg = makeSvgElement();
    svg.dataset.original = "true";
    serializeSvg(svg);
    // Original element should still have its data attribute
    expect(svg.dataset.original).toBe("true");
  });

  it("should resolve CSS variables in the serialised output", () => {
    vi.spyOn(globalThis, "getComputedStyle").mockReturnValue({
      getPropertyValue: (name: string) =>
        name === "--highlight" ? "#facc15" : "",
    } as unknown as CSSStyleDeclaration);

    const svg = makeSvgElement();
    svg.setAttribute("stroke", "var(--highlight)");
    const result = serializeSvg(svg);
    expect(result).toContain("#facc15");
    expect(result).not.toContain("var(--highlight)");
  });
});

describe("downloadSvg", () => {
  let mockAnchor: {
    href: string;
    download: string;
    click: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15"));

    mockAnchor = { href: "", download: "", click: vi.fn(), remove: vi.fn() };

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "a") return mockAnchor as unknown as HTMLAnchorElement;
      return originalCreateElement(tag);
    });
    vi.spyOn(document.body, "append").mockImplementation(vi.fn());
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:fake-svg-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    for (const svg of document.querySelectorAll("svg")) svg.remove();
  });

  function makeSvgElement(): SVGSVGElement {
    const svg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    ) as SVGSVGElement;
    svg.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 800,
      height: 800,
    });
    document.body.append(svg);
    return svg;
  }

  it("should create an anchor element with a blob URL and trigger a click", () => {
    const svg = makeSvgElement();
    downloadSvg(svg);

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockAnchor.href).toBe("blob:fake-svg-url");
    expect(mockAnchor.click).toHaveBeenCalledTimes(1);
  });

  it("should use the default filename when none is provided", () => {
    const svg = makeSvgElement();
    downloadSvg(svg);
    expect(mockAnchor.download).toBe("trend-radar-2025-06-15.svg");
  });

  it("should use the provided filename", () => {
    const svg = makeSvgElement();
    downloadSvg(svg, "my-export.svg");
    expect(mockAnchor.download).toBe("my-export.svg");
  });

  it("should remove the anchor element after clicking", () => {
    const svg = makeSvgElement();
    downloadSvg(svg);
    expect(mockAnchor.remove).toHaveBeenCalledTimes(1);
  });

  it("should revoke the object URL after the download is triggered", () => {
    const svg = makeSvgElement();
    downloadSvg(svg);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake-svg-url");
  });
});
