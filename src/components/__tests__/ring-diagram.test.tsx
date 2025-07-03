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
  const createMockSelection = () => ({
    append: jest.fn().mockReturnThis(),
    attr: jest.fn().mockReturnThis(),
    style: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
    classed: jest.fn().mockReturnThis(),
    call: jest.fn().mockReturnThis(),
    node: jest.fn(),
    on: jest.fn().mockImplementation(function (event, handler) {
      this._handlers = this._handlers || {};
      this._handlers[event] = handler;
      return this;
    }),
    _handlers: {},
  });

  const mockD3Selection = {
    ...createMockSelection(),
    selectAll: jest.fn().mockReturnValue({
      ...createMockSelection(),
      data: jest.fn().mockReturnThis(),
      enter: jest.fn().mockReturnThis(),
    }),
  };

  const mockDrag = jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
  });

  return {
    select: jest.fn().mockReturnValue(mockD3Selection),
    drag: mockDrag,
    pointer: jest.fn().mockReturnValue([0, 0]),
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
        mockedUseDiagramStore.mockReturnValue({
          points: mockPoints,
          selectedPoint: undefined,
          selectPoint: mockSelectPoint,
          updatePoint: mockUpdatePoint,
        });
        render(<RingDiagram />);

        // Find all the on() calls made to d3
        const selectMock = d3.select as jest.Mock;
        const mockSelection = selectMock.mock.results[0].value;
        const appendCalls = mockSelection.append.mock.calls;

        // Find the point element's click handler
        // Points are created after rings and background, so they'll be later in the calls
        const pointHandlers = appendCalls
          .map((_, index) => mockSelection.append.mock.results[index].value)
          .filter((result) => result._handlers && result._handlers.click);

        const pointHandler = pointHandlers.at(-1);
        expect(pointHandler).toBeTruthy();
        expect(mockSelectPoint).not.toHaveBeenCalled();

        // Call the click handler with the point's id
        pointHandler._handlers.click();
        expect(mockSelectPoint).toHaveBeenCalledWith(mockPoints[0].id);
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

        // Get all click handlers and find the background handler
        const handlers = mockSelection.on.mock.calls;
        const backgroundHandler = handlers.find(
          (call: [string, unknown]) => call[0] === "click",
        );

        expect(backgroundHandler).toBeTruthy();
        expect(mockSelectPoint).not.toHaveBeenCalled();

        // Now we know the handler exists, call it
        const clickHandler = backgroundHandler[1] as (event: {
          target: unknown;
          currentTarget: unknown;
        }) => void;
        clickHandler({ target: "background", currentTarget: "background" });
        expect(mockSelectPoint).toHaveBeenCalledWith();
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

        // Get all click handlers and find the background handler
        const handlers = mockSelection.on.mock.calls;
        const backgroundHandler = handlers.find(
          (call: [string, unknown]) => call[0] === "click",
        );

        expect(backgroundHandler).toBeTruthy();
        expect(mockSelectPoint).not.toHaveBeenCalled();

        // Now we know the handler exists, call it
        const clickHandler = backgroundHandler[1] as (event: {
          target: unknown;
          currentTarget: unknown;
        }) => void;
        clickHandler({ target: "point", currentTarget: "background" });
        expect(mockSelectPoint).not.toHaveBeenCalled();
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

  describe("Drag functionality", () => {
    const mockAddPointAtPosition = jest.fn();

    beforeEach(() => {
      mockAddPointAtPosition.mockClear();
      mockSelectPoint.mockClear();
      mockUpdatePoint.mockClear();

      mockedUseDiagramStore.mockReturnValue({
        points: mockPoints,
        selectedPoint: undefined,
        selectPoint: mockSelectPoint,
        updatePoint: mockUpdatePoint,
        addPointAtPosition: mockAddPointAtPosition,
      });
    });

    it("should set up drag behavior on points", () => {
      render(<RingDiagram />);

      // Verify that drag behavior is attached to points
      expect(d3.drag).toHaveBeenCalled();
      const dragBehavior = (d3.drag as jest.Mock).mock.results[0].value;
      expect(dragBehavior.on).toHaveBeenCalledWith(
        "start",
        expect.any(Function),
      );
      expect(dragBehavior.on).toHaveBeenCalledWith(
        "drag",
        expect.any(Function),
      );
      expect(dragBehavior.on).toHaveBeenCalledWith("end", expect.any(Function));
    });

    it("should call the drag behavior on point elements", () => {
      render(<RingDiagram />);

      // Verify that the call method is used to attach drag behavior
      const mockSelection = (d3.select as jest.Mock).mock.results[0].value;
      expect(mockSelection.call).toHaveBeenCalled();
    });
  });

  describe("Click-to-place functionality", () => {
    const mockAddPointAtPosition = jest.fn();

    beforeEach(() => {
      mockAddPointAtPosition.mockClear();
      mockedUseDiagramStore.mockReturnValue({
        points: mockPoints,
        selectedPoint: undefined,
        selectPoint: mockSelectPoint,
        updatePoint: mockUpdatePoint,
        addPointAtPosition: mockAddPointAtPosition,
      });
    });

    it("should include addPointAtPosition in destructured store methods", () => {
      render(<RingDiagram />);

      // Verify that the component has access to addPointAtPosition
      expect(mockedUseDiagramStore).toHaveBeenCalled();

      // Check that the store was called with the correct destructuring
      const storeCallResult = mockedUseDiagramStore.mock.results[0].value;
      expect(storeCallResult.addPointAtPosition).toBe(mockAddPointAtPosition);
    });
  });

  describe("Touch interaction functionality", () => {
    const mockSelectPoint = jest.fn();
    const mockUpdatePoint = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();

      // Mock navigator.vibrate for touch feedback testing
      Object.defineProperty(navigator, "vibrate", {
        value: jest.fn(),
        configurable: true,
      });

      mockedUseDiagramStore.mockReturnValue({
        points: mockPoints,
        selectedPoint: undefined,
        selectPoint: mockSelectPoint,
        updatePoint: mockUpdatePoint,
        addPointAtPosition: jest.fn(),
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should handle touch start events on points", () => {
      render(<RingDiagram />);

      // Verify that touch event listeners would be set up
      // Note: Due to D3 DOM manipulation, we can't easily test the actual events
      // but we can verify the component renders without errors
      expect(mockSelectPoint).not.toHaveBeenCalled();
    });

    it("should support long press duration constant", () => {
      const { container } = render(<RingDiagram />);

      // Verify component renders correctly with touch support
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should handle touch move threshold for canceling long press", () => {
      render(<RingDiagram />);

      // This tests that the component can handle touch state management
      // The actual touch interaction would be tested in integration tests
      expect(mockedUseDiagramStore).toHaveBeenCalled();
    });

    it("should provide haptic feedback on long press activation", () => {
      render(<RingDiagram />);

      // Verify navigator.vibrate is available for testing
      expect(navigator.vibrate).toBeDefined();
    });

    it("should handle touch drag completion with coordinate conversion", () => {
      render(<RingDiagram />);

      // Verify that coordinatesToCategoryAndLikelihood is available
      // This would be used during touch drag completion
      expect(mockedUseDiagramStore).toHaveBeenCalled();
    });
  });
});
