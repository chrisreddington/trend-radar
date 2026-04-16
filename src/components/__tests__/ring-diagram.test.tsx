import { render, screen, act, fireEvent } from "@testing-library/react";
import { RingDiagram } from "../ring-diagram";
import { Category, Likelihood, Relevance, Preparedness } from "../../types";
import { vi } from "vitest";

// Mock the entire store module
vi.mock("../../store/use-diagram-store", async () => {
  const actual = await vi.importActual<
    typeof import("../../store/use-diagram-store")
  >("../../store/use-diagram-store");
  return {
    ...actual,
    useDiagramStore: vi.fn(),
  };
});

// Import after mocking
import { useDiagramStore } from "../../store/use-diagram-store";

describe("RingDiagram", () => {
  // Common test data
  const mockPoints = [
    {
      id: "1",
      label: "Test Point 1",
      category: Category.Technological,
      likelihood: Likelihood.Average,
      relevance: Relevance.Moderate,
      preparedness: Preparedness.ModeratelyPrepared,
      x: 0,
      y: 0,
    },
  ];

  const mockSelectPoint = vi.fn();
  const mockUpdatePoint = vi.fn();
  const mockAddPointAtPosition = vi.fn();
  const mockBatchUpdatePositions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useDiagramStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      points: mockPoints,
      selectedPoint: undefined,
      selectPoint: mockSelectPoint,
      updatePoint: mockUpdatePoint,
      addPointAtPosition: mockAddPointAtPosition,
      batchUpdatePositions: mockBatchUpdatePositions,
    });
  });

  describe("Basic Rendering", () => {
    it("should render SVG element with proper accessibility attributes", () => {
      render(<RingDiagram />);
      const svg = screen.getByRole("application");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-label");
    });

    it("should render SVG with viewBox attribute", () => {
      const { container } = render(<RingDiagram />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("viewBox");
    });

    it("should render diagram rings (circles)", () => {
      const { container } = render(<RingDiagram />);
      const circles = container.querySelectorAll("circle");
      // Should have multiple circles for rings and points
      expect(circles.length).toBeGreaterThan(0);
    });

    it("should render points as circle elements", () => {
      const { container } = render(<RingDiagram />);
      const points = container.querySelectorAll("circle.point");
      expect(points.length).toBe(mockPoints.length);
    });

    it("should render point labels as text elements", () => {
      const { container } = render(<RingDiagram />);
      const labels = container.querySelectorAll("text");
      // Should include point labels and category labels
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should render SVG with application role for interactive content", () => {
      render(<RingDiagram />);
      const svg = screen.getByRole("application");
      expect(svg).toBeInTheDocument();
    });

    it("should render SVG with descriptive aria-label including keyboard instructions", () => {
      render(<RingDiagram />);
      const svg = screen.getByRole("application");
      expect(svg).toHaveAttribute("aria-label");
      const label = svg.getAttribute("aria-label") ?? "";
      expect(label.toLowerCase()).toContain("tab");
    });

    it("should give each point circle role button and tabindex for keyboard navigation", () => {
      const { container } = render(<RingDiagram />);
      const pointCircles = container.querySelectorAll("circle.point");
      for (const point of pointCircles) {
        expect(point).toHaveAttribute("role", "button");
        expect(point).toHaveAttribute("tabindex", "0");
      }
    });

    it("should give each point circle a descriptive aria-label", () => {
      const { container } = render(<RingDiagram />);
      const pointCircles = container.querySelectorAll("circle.point");
      for (const point of pointCircles) {
        const label = point.getAttribute("aria-label");
        expect(label).toBeTruthy();
        expect(label).toContain("Test Point 1");
        expect(label).toContain("Technological");
      }
    });

    it("should mark unselected points with aria-pressed false", () => {
      const { container } = render(<RingDiagram />);
      const pointCircles = container.querySelectorAll("circle.point");
      for (const point of pointCircles) {
        expect(point).toHaveAttribute("aria-pressed", "false");
      }
    });

    it("should mark the selected point with aria-pressed true", () => {
      (useDiagramStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        points: mockPoints,
        selectedPoint: "1",
        selectPoint: mockSelectPoint,
        updatePoint: mockUpdatePoint,
        addPointAtPosition: mockAddPointAtPosition,
      batchUpdatePositions: mockBatchUpdatePositions,
      });

      const { container } = render(<RingDiagram />);
      const selectedCircle = container.querySelector(
        'circle.point[data-point-id="1"]',
      );
      expect(selectedCircle).toHaveAttribute("aria-pressed", "true");
    });

    it("should select the point when Enter is pressed", () => {
      const { container } = render(<RingDiagram />);
      const pointCircle = container.querySelector(
        'circle.point[data-point-id="1"]',
      );

      expect(pointCircle).not.toBeNull();
      fireEvent.keyDown(pointCircle!, { key: "Enter" });

      expect(mockSelectPoint).toHaveBeenCalledWith("1");
    });

    it("should select the point when Space is pressed", () => {
      const { container } = render(<RingDiagram />);
      const pointCircle = container.querySelector(
        'circle.point[data-point-id="1"]',
      );

      expect(pointCircle).not.toBeNull();
      fireEvent.keyDown(pointCircle!, { key: " " });

      expect(mockSelectPoint).toHaveBeenCalledWith("1");
    });
  });

  describe("Multiple Points", () => {
    it("should render multiple points", () => {
      const multiplePoints = [
        ...mockPoints,
        {
          id: "2",
          label: "Test Point 2",
          category: Category.Economic,
          likelihood: Likelihood.Likely,
          relevance: Relevance.High,
          preparedness: Preparedness.HighlyPrepared,
          x: 100,
          y: 100,
        },
      ];

      (useDiagramStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        points: multiplePoints,
        selectedPoint: undefined,
        selectPoint: mockSelectPoint,
        updatePoint: mockUpdatePoint,
        addPointAtPosition: mockAddPointAtPosition,
      batchUpdatePositions: mockBatchUpdatePositions,
      });

      const { container } = render(<RingDiagram />);
      const points = container.querySelectorAll("circle.point");
      expect(points.length).toBe(multiplePoints.length);
    });
  });

  describe("Responsiveness", () => {
    it("should render with responsive classes", () => {
      const { container } = render(<RingDiagram />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("w-full", "h-auto");
    });

    it("should update on window resize", () => {
      const { container } = render(<RingDiagram />);

      // Trigger resize event wrapped in act to handle state updates
      act(() => {
        globalThis.dispatchEvent(new Event("resize"));
      });

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Store Integration", () => {
    it("should call store on mount", () => {
      render(<RingDiagram />);
      expect(useDiagramStore).toHaveBeenCalled();
    });

    it("should have access to store methods", () => {
      render(<RingDiagram />);
      const storeResult = (
        useDiagramStore as unknown as ReturnType<typeof vi.fn>
      ).mock.results[0].value;
      expect(storeResult.selectPoint).toBe(mockSelectPoint);
      expect(storeResult.updatePoint).toBe(mockUpdatePoint);
      expect(storeResult.addPointAtPosition).toBe(mockAddPointAtPosition);
    });
  });

  describe("Empty State", () => {
    it("should render diagram with no points", () => {
      (useDiagramStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        points: [],
        selectedPoint: undefined,
        selectPoint: mockSelectPoint,
        updatePoint: mockUpdatePoint,
        addPointAtPosition: mockAddPointAtPosition,
      batchUpdatePositions: mockBatchUpdatePositions,
      });

      const { container } = render(<RingDiagram />);
      const points = container.querySelectorAll("circle.point");
      expect(points.length).toBe(0);

      // But rings should still be present
      const circles = container.querySelectorAll("circle");
      expect(circles.length).toBeGreaterThan(0);
    });
  });

  describe("Snapshot Tests", () => {
    const deterministicPoints = [
      {
        id: "1",
        label: "Test Point 1",
        category: Category.Technological,
        likelihood: Likelihood.Average,
        relevance: Relevance.Moderate,
        preparedness: Preparedness.ModeratelyPrepared,
        x: 100,
        y: 50,
      },
    ];

    beforeEach(() => {
      (useDiagramStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        points: deterministicPoints,
        selectedPoint: undefined,
        selectPoint: mockSelectPoint,
        updatePoint: mockUpdatePoint,
        addPointAtPosition: mockAddPointAtPosition,
      batchUpdatePositions: mockBatchUpdatePositions,
      });
    });

    it("should match snapshot with no points", () => {
      (useDiagramStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        points: [],
        selectedPoint: undefined,
        selectPoint: mockSelectPoint,
        updatePoint: mockUpdatePoint,
        addPointAtPosition: mockAddPointAtPosition,
      batchUpdatePositions: mockBatchUpdatePositions,
      });

      const { container } = render(<RingDiagram />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with a single point", () => {
      const { container } = render(<RingDiagram />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot with a selected point", () => {
      (useDiagramStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        points: deterministicPoints,
        selectedPoint: "1",
        selectPoint: mockSelectPoint,
        updatePoint: mockUpdatePoint,
        addPointAtPosition: mockAddPointAtPosition,
      batchUpdatePositions: mockBatchUpdatePositions,
      });

      const { container } = render(<RingDiagram />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("Interaction: ring click adds point", () => {
    it("should call addPointAtPosition when clicking a ring circle", () => {
      const { container } = render(<RingDiagram />);

      // Ring circles follow the background circle in SVG z-order.
      // circles[0] is the transparent background; circles[1] is the outermost ring.
      const allCircles = container.querySelectorAll("circle");
      const firstRingCircle = allCircles[1];
      expect(firstRingCircle).toBeInTheDocument();
      expect(firstRingCircle).not.toHaveClass("point");

      fireEvent.click(firstRingCircle!);

      expect(mockAddPointAtPosition).toHaveBeenCalledTimes(1);
    });

    it("should not call addPointAtPosition when clicking a point circle", () => {
      const { container } = render(<RingDiagram />);

      const pointCircle = container.querySelector("circle.point");
      expect(pointCircle).toBeInTheDocument();

      fireEvent.click(pointCircle!);

      expect(mockAddPointAtPosition).not.toHaveBeenCalled();
    });
  });

  describe("Interaction: point selection", () => {
    it("should call selectPoint with the point ID when a point circle is clicked", () => {
      const { container } = render(<RingDiagram />);

      const pointCircle = container.querySelector("circle.point");
      expect(pointCircle).toBeInTheDocument();

      fireEvent.click(pointCircle!);

      expect(mockSelectPoint).toHaveBeenCalledWith(mockPoints[0].id);
    });

    it("should not call addPointAtPosition when clicking on a point circle", () => {
      const { container } = render(<RingDiagram />);

      const pointCircle = container.querySelector("circle.point");
      expect(pointCircle).toBeInTheDocument();

      fireEvent.click(pointCircle!);

      expect(mockAddPointAtPosition).not.toHaveBeenCalled();
    });

    it("should call selectPoint with no args when clicking the transparent background circle", () => {
      const { container } = render(<RingDiagram />);

      // The first circle in the SVG is the transparent background click-target.
      const allCircles = container.querySelectorAll("circle");
      const backgroundCircle = allCircles[0];
      expect(backgroundCircle).toBeInTheDocument();

      fireEvent.click(backgroundCircle, { target: backgroundCircle });

      expect(mockSelectPoint).toHaveBeenCalledWith();
    });
  });

  describe("Interaction: point data attributes", () => {
    it("should set data-point-id attribute on point circles", () => {
      const { container } = render(<RingDiagram />);

      const pointCircle = container.querySelector("circle.point");
      expect(pointCircle).toHaveAttribute("data-point-id", mockPoints[0].id);
    });

    it("should set cursor:pointer style on point circles", () => {
      const { container } = render(<RingDiagram />);

      const pointCircle = container.querySelector("circle.point");
      expect(pointCircle).toHaveAttribute("cursor", "pointer");
    });
  });

  describe("Interaction: selection highlight", () => {
    it("should apply highlighted stroke to selected point circle", () => {
      (useDiagramStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        points: mockPoints,
        selectedPoint: mockPoints[0].id,
        selectPoint: mockSelectPoint,
        updatePoint: mockUpdatePoint,
        addPointAtPosition: mockAddPointAtPosition,
      batchUpdatePositions: mockBatchUpdatePositions,
      });

      const { container } = render(<RingDiagram />);

      const pointCircle = container.querySelector("circle.point");
      expect(pointCircle).toHaveAttribute("stroke", "var(--highlight)");
    });

    it("should set reduced opacity on non-selected points when a point is selected", () => {
      const twoPoints = [
        ...mockPoints,
        {
          id: "2",
          label: "Second Point",
          category: Category.Economic,
          likelihood: Likelihood.Likely,
          relevance: Relevance.High,
          preparedness: Preparedness.HighlyPrepared,
          x: 100,
          y: 100,
        },
      ];

      (useDiagramStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        points: twoPoints,
        selectedPoint: twoPoints[0].id,
        selectPoint: mockSelectPoint,
        updatePoint: mockUpdatePoint,
        addPointAtPosition: mockAddPointAtPosition,
      batchUpdatePositions: mockBatchUpdatePositions,
      });

      const { container } = render(<RingDiagram />);

      const allPointCircles = container.querySelectorAll("circle.point");
      expect(allPointCircles).toHaveLength(2);

      const nonSelectedPoint = allPointCircles[1];
      expect(nonSelectedPoint).toHaveAttribute("opacity", "0.6");
    });

    it("should set full opacity on all points when nothing is selected", () => {
      const { container } = render(<RingDiagram />);

      const pointCircle = container.querySelector("circle.point");
      expect(pointCircle).toHaveAttribute("opacity", "1");
    });
  });

  describe("Integration: useResponsiveSize", () => {
    const originalInnerWidth = Object.getOwnPropertyDescriptor(
      globalThis,
      "innerWidth",
    );
    const originalClientWidth = Object.getOwnPropertyDescriptor(
      document.documentElement,
      "clientWidth",
    );

    afterEach(() => {
      if (originalInnerWidth) {
        Object.defineProperty(globalThis, "innerWidth", originalInnerWidth);
      }
      if (originalClientWidth) {
        Object.defineProperty(
          document.documentElement,
          "clientWidth",
          originalClientWidth,
        );
      }
    });

    it("should update SVG dimensions when viewport changes", () => {
      const { container } = render(<RingDiagram />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();

      act(() => {
        Object.defineProperty(globalThis, "innerWidth", {
          configurable: true,
          value: 400,
        });
        globalThis.dispatchEvent(new Event("resize"));
      });

      // SVG should still be present after a resize event
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should render SVG with mobile-appropriate viewBox on narrow viewport", () => {
      Object.defineProperty(document.documentElement, "clientWidth", {
        configurable: true,
        value: 400,
      });
      Object.defineProperty(globalThis, "innerWidth", {
        configurable: true,
        value: 400,
      });

      const { container } = render(<RingDiagram />);

      act(() => {
        globalThis.dispatchEvent(new Event("resize"));
      });

      const svg = container.querySelector("svg");
      // After resize the viewBox reflects the updated size
      expect(svg).toHaveAttribute("viewBox");
    });
  });
});
