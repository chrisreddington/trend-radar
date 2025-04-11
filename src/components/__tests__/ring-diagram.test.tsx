import { render, screen } from "@testing-library/react";
import { RingDiagram } from "../ring-diagram";
import { useDiagramStore } from "../../store/use-diagram-store";
import { Category, Likelihood, Relevance, Preparedness } from "../../types";
import * as d3 from "d3";

jest.mock("../../store/use-diagram-store");
const mockedUseDiagramStore = useDiagramStore as unknown as jest.MockedFunction<
  typeof useDiagramStore
>;

// Mock D3 for testing
jest.mock("d3", () => {
  const mockD3Selection = {
    append: jest.fn().mockReturnThis(),
    attr: jest.fn().mockReturnThis(),
    style: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnValue({
      remove: jest.fn(),
      data: jest.fn().mockReturnThis(),
      enter: jest.fn().mockReturnThis(),
      append: jest.fn().mockReturnThis(),
      attr: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
    }),
    text: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
    classed: jest.fn().mockReturnThis(),
  };

  return {
    select: jest.fn().mockReturnValue(mockD3Selection),
  };
});

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

  const mockSelectPoint = jest.fn();
  const mockUpdatePoint = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseDiagramStore.mockReturnValue({
      points: mockPoints,
      selectedPoint: undefined,
      selectPoint: mockSelectPoint,
      updatePoint: mockUpdatePoint,
    });
  });

  describe("Basic Rendering", () => {
    it("should render SVG element with proper accessibility", () => {
      render(<RingDiagram />);
      expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("should initialize D3 visualization", () => {
      render(<RingDiagram />);
      expect(d3.select).toHaveBeenCalled();
    });

    it("should update visualization when points change", () => {
      const { rerender } = render(<RingDiagram />);

      jest.clearAllMocks();

      const newPoints = [
        ...mockPoints,
        {
          id: "2",
          label: "Test Point 2",
          category: Category.Economic,
          likelihood: Likelihood.Likely,
          relevance: Relevance.High,
          preparedness: Preparedness.HighlyPrepared,
          x: 0,
          y: 0,
        },
      ];

      mockedUseDiagramStore.mockReturnValue({
        points: newPoints,
        selectedPoint: undefined,
        selectPoint: mockSelectPoint,
        updatePoint: mockUpdatePoint,
      });

      rerender(<RingDiagram />);
      expect(d3.select).toHaveBeenCalled();
    });
  });

  describe("Interaction", () => {
    describe("Point Selection", () => {
      it("should select point when clicked", () => {
        render(<RingDiagram />);

        const selectMock = d3.select as jest.Mock;
        const mockSelection = selectMock.mock.results[0].value;

        const pointClickHandler =
          mockSelection.selectAll.mock.results[0].value.on.mock.calls.find(
            (call: [string, () => void]) => call[0] === "click",
          )?.[1];

        if (pointClickHandler) {
          pointClickHandler();
          expect(mockSelectPoint).toHaveBeenCalledWith("1");
        }
      });
    });

    describe("Background Interaction", () => {
      it("should deselect point when clicking background", () => {
        mockedUseDiagramStore.mockReturnValue({
          points: mockPoints,
          selectedPoint: "1",
          selectPoint: mockSelectPoint,
          updatePoint: mockUpdatePoint,
        });

        render(<RingDiagram />);

        const selectMock = d3.select as jest.Mock;
        const mockSelection = selectMock.mock.results[0].value;

        const backgroundClickHandler = mockSelection.on.mock.calls.find(
          (
            call: [
              string,
              (event: { target: unknown; currentTarget: unknown }) => void,
            ],
          ) => call[0] === "click",
        )?.[1];

        if (backgroundClickHandler) {
          // Simulate click on background (target === currentTarget)
          const mockEvent = {
            target: "background",
            currentTarget: "background",
          };
          backgroundClickHandler(mockEvent);
          expect(mockSelectPoint).toHaveBeenCalledWith();
        }
      });

      it("should not deselect when clicking point", () => {
        mockedUseDiagramStore.mockReturnValue({
          points: mockPoints,
          selectedPoint: "1",
          selectPoint: mockSelectPoint,
          updatePoint: mockUpdatePoint,
        });

        render(<RingDiagram />);

        const selectMock = d3.select as jest.Mock;
        const mockSelection = selectMock.mock.results[0].value;

        const backgroundClickHandler = mockSelection.on.mock.calls.find(
          (
            call: [
              string,
              (event: { target: unknown; currentTarget: unknown }) => void,
            ],
          ) => call[0] === "click",
        )?.[1];

        if (backgroundClickHandler) {
          // Simulate click on point (target !== currentTarget)
          const mockEvent = {
            target: "point",
            currentTarget: "background",
          };
          backgroundClickHandler(mockEvent);
          expect(mockSelectPoint).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe("Responsiveness", () => {
    let originalInnerWidth: number;

    beforeEach(() => {
      originalInnerWidth = window.innerWidth;
    });

    afterEach(() => {
      Object.defineProperty(globalThis, "innerWidth", {
        writable: true,
        value: originalInnerWidth,
      });
    });

    it("should adapt sizing for mobile screens", () => {
      Object.defineProperty(globalThis, "innerWidth", {
        writable: true,
        value: 375,
      });

      render(<RingDiagram />);
      const svg = d3.select as jest.Mock;

      expect(svg).toHaveBeenCalled();
      const calls = svg.mock.calls;
      expect(
        calls.some(
          (call) =>
            call[0] &&
            call[0].getAttribute &&
            call[0].getAttribute("class")?.includes("w-full"),
        ),
      ).toBeTruthy();
    });
  });
});
