import { render, screen, act } from "@testing-library/react";
import { RingDiagram } from "../ring-diagram";
import { Category, Likelihood, Relevance, Preparedness } from "../../types";
import { vi } from "vitest";

// Mock the entire store module
vi.mock("../../store/use-diagram-store", async () => {
  const actual = await vi.importActual<typeof import("../../store/use-diagram-store")>("../../store/use-diagram-store");
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

  beforeEach(() => {
    vi.clearAllMocks();
    (useDiagramStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      points: mockPoints,
      selectedPoint: undefined,
      selectPoint: mockSelectPoint,
      updatePoint: mockUpdatePoint,
      addPointAtPosition: mockAddPointAtPosition,
    });
  });

  describe("Basic Rendering", () => {
    it("should render SVG element with proper accessibility", () => {
      render(<RingDiagram />);
      expect(screen.getByRole("img")).toBeInTheDocument();
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
      const storeResult = (useDiagramStore as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
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
      });

      const { container } = render(<RingDiagram />);
      const points = container.querySelectorAll("circle.point");
      expect(points.length).toBe(0);

      // But rings should still be present
      const circles = container.querySelectorAll("circle");
      expect(circles.length).toBeGreaterThan(0);
    });
  });
});
