import { useDiagramStore } from "../use-diagram-store";
import { Likelihood, Point, Preparedness, Relevance } from "../../types";
import { Category } from "../../types";

describe("useDiagramStore", () => {
  // Set up test data and mocks
  const mockUUID = "123e4567-e89b-12d3-a456-426614174000";
  const mockPoint: Point = {
    id: mockUUID,
    label: "Test Point",
    category: Category.Technological,
    relevance: Relevance.High,
    preparedness: Preparedness.HighlyPrepared,
    likelihood: Likelihood.HighlyLikely,
    x: 0,
    y: 0,
  };

  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(() => {
    // Reset store and mocks before each test
    useDiagramStore.setState({ points: [], selectedPoint: undefined });
    jest.clearAllMocks();
    Object.defineProperty(globalThis, "localStorage", {
      value: mockLocalStorage,
    });
    globalThis.crypto.randomUUID = jest.fn().mockReturnValue(mockUUID);
  });

  describe("Point Management", () => {
    describe("addPoint", () => {
      it("should generate UUID and add new point to store", () => {
        const newPoint = {
          label: "Test Point",
          category: Category.Technological,
          relevance: Relevance.High,
          preparedness: Preparedness.HighlyPrepared,
          likelihood: Likelihood.HighlyLikely,
          x: 0,
          y: 0,
        };

        const { addPoint } = useDiagramStore.getState();
        addPoint(newPoint);

        const state = useDiagramStore.getState();
        expect(state.points).toHaveLength(1);
        const addedPoint = state.points[0];

        // Check all properties except coordinates
        expect(addedPoint).toMatchObject({
          id: mockUUID,
          label: newPoint.label,
          category: newPoint.category,
          relevance: newPoint.relevance,
          preparedness: newPoint.preparedness,
          likelihood: newPoint.likelihood,
        });

        // Verify coordinates are numbers and within bounds
        expect(typeof addedPoint.x).toBe("number");
        expect(typeof addedPoint.y).toBe("number");
        expect(
          Math.sqrt(Math.pow(addedPoint.x, 2) + Math.pow(addedPoint.y, 2)),
        ).toBeLessThanOrEqual(400);
      });
    });

    describe("updatePoint", () => {
      beforeEach(() => {
        useDiagramStore.setState({ points: [mockPoint] });
      });

      it("should update specified properties of existing point", () => {
        const updates = {
          label: "Updated Point",
          relevance: Relevance.Low,
        };

        const { updatePoint } = useDiagramStore.getState();
        updatePoint(mockUUID, updates);

        const state = useDiagramStore.getState();
        expect(state.points[0]).toEqual({
          ...mockPoint,
          ...updates,
        });
      });

      it("should not modify state when point ID does not exist", () => {
        const { updatePoint } = useDiagramStore.getState();
        updatePoint("non-existent-id", { label: "Updated" });

        const state = useDiagramStore.getState();
        expect(state.points[0]).toEqual(mockPoint);
      });

      it("should recalculate position when category changes", () => {
        const initialPos = { x: 0, y: 0 };
        useDiagramStore.setState({
          points: [{ ...mockPoint, ...initialPos }],
        });

        const updates = {
          category: Category.Economic,
        };

        const { updatePoint } = useDiagramStore.getState();
        updatePoint(mockUUID, updates);

        const state = useDiagramStore.getState();
        expect(state.points[0].category).toBe(Category.Economic);

        // Calculate magnitude of position change
        const dx = state.points[0].x - initialPos.x;
        const dy = state.points[0].y - initialPos.y;
        const change = Math.hypot(dx, dy);

        // Verify that position changed significantly
        expect(change).toBeGreaterThan(0);
      });

      it("should recalculate position when likelihood changes", () => {
        const updates = {
          likelihood: Likelihood.Unlikely,
        };

        const { updatePoint } = useDiagramStore.getState();
        updatePoint(mockUUID, updates);

        const state = useDiagramStore.getState();
        expect(state.points[0].likelihood).toBe(Likelihood.Unlikely);
        // Position should be different from original
        expect(state.points[0].x).not.toBe(0);
        expect(state.points[0].y).not.toBe(0);
      });

      it("should preserve position when updating other properties", () => {
        const originalX = 100;
        const originalY = 200;
        useDiagramStore.setState({
          points: [
            {
              ...mockPoint,
              x: originalX,
              y: originalY,
            },
          ],
        });

        const updates = {
          label: "Updated Label",
          relevance: Relevance.Low,
          preparedness: Preparedness.InadequatelyPrepared,
        };

        const { updatePoint } = useDiagramStore.getState();
        updatePoint(mockUUID, updates);

        const state = useDiagramStore.getState();
        expect(state.points[0].x).toBe(originalX);
        expect(state.points[0].y).toBe(originalY);
      });
    });

    describe("removePoint", () => {
      it("should remove point and clear selection if it was selected", () => {
        useDiagramStore.setState({
          points: [mockPoint],
          selectedPoint: mockUUID,
        });

        const { removePoint } = useDiagramStore.getState();
        removePoint(mockUUID);

        const state = useDiagramStore.getState();
        expect(state.points).toHaveLength(0);
        expect(state.selectedPoint).toBeUndefined();
      });

      it("should preserve selection when removing unselected point", () => {
        useDiagramStore.setState({
          points: [mockPoint],
          selectedPoint: "other-id",
        });

        const { removePoint } = useDiagramStore.getState();
        removePoint(mockUUID);

        const state = useDiagramStore.getState();
        expect(state.points).toHaveLength(0);
        expect(state.selectedPoint).toBe("other-id");
      });
    });
  });

  describe("Point Selection", () => {
    it("should update selected point ID", () => {
      const { selectPoint } = useDiagramStore.getState();
      selectPoint(mockUUID);

      const state = useDiagramStore.getState();
      expect(state.selectedPoint).toBe(mockUUID);
    });

    it("should clear selection when passing null", () => {
      useDiagramStore.setState({ selectedPoint: mockUUID });

      const { selectPoint } = useDiagramStore.getState();
      selectPoint("");

      const state = useDiagramStore.getState();
      expect(state.selectedPoint).toBeUndefined();
    });
  });

  describe("Persistence", () => {
    describe("saveState", () => {
      it("should persist points to localStorage", () => {
        useDiagramStore.setState({ points: [mockPoint] });

        const { saveState } = useDiagramStore.getState();
        saveState();

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          "diagramState",
          JSON.stringify({ points: [mockPoint] }),
        );
      });
    });

    describe("loadState", () => {
      it("should restore points from localStorage and reset selection", () => {
        mockLocalStorage.getItem.mockReturnValue(
          JSON.stringify({ points: [mockPoint] }),
        );

        const { loadState } = useDiagramStore.getState();
        loadState();

        const state = useDiagramStore.getState();
        expect(state.points).toEqual([mockPoint]);
        expect(state.selectedPoint).toBeNull();
      });

      it("should maintain empty state when no data in localStorage", () => {
        mockLocalStorage.getItem.mockReturnValue("");

        const { loadState } = useDiagramStore.getState();
        loadState();

        const state = useDiagramStore.getState();
        expect(state.points).toEqual([]);
        expect(state.selectedPoint).toBeUndefined();
      });
    });
  });

  describe("Position Calculations", () => {
    it("should calculate new position when adding point", () => {
      const newPoint = {
        label: "Test Point",
        category: Category.Technological,
        relevance: Relevance.High,
        preparedness: Preparedness.HighlyPrepared,
        likelihood: Likelihood.HighlyLikely,
        x: 0,
        y: 0,
      };

      const { addPoint } = useDiagramStore.getState();
      addPoint(newPoint);

      const state = useDiagramStore.getState();
      expect(state.points[0].x).not.toBe(0);
      expect(state.points[0].y).not.toBe(0);
      // Position should be within diagram bounds (radius <= 400)
      expect(
        Math.sqrt(
          Math.pow(state.points[0].x, 2) + Math.pow(state.points[0].y, 2),
        ),
      ).toBeLessThanOrEqual(400);
    });

    it("should calculate consistent positions when category and likelihood are updated", () => {
      // Add initial point
      useDiagramStore.setState({ points: [mockPoint] });

      const updates = {
        category: Category.Economic,
        likelihood: Likelihood.Unlikely,
      };

      const { updatePoint } = useDiagramStore.getState();
      updatePoint(mockUUID, updates);

      const state = useDiagramStore.getState();
      const updatedPoint = state.points[0];

      // 1. Verify the point is within the diagram bounds
      const radius = Math.sqrt(
        Math.pow(updatedPoint.x, 2) + Math.pow(updatedPoint.y, 2),
      );
      expect(radius).toBeLessThanOrEqual(400);

      // 2. Get category position information
      const categories = Object.values(Category);
      const categoryIndex = categories.indexOf(Category.Economic);
      const anglePerCategory = (2 * Math.PI) / categories.length;

      // 3. Calculate the angle of the point (accounting for coordinate system differences)
      const pointAngle = Math.atan2(updatedPoint.y, updatedPoint.x);
      const normalizedPointAngle = (pointAngle + 2 * Math.PI) % (2 * Math.PI);

      // 4. Calculate the expected angle range for this category
      const expectedBaseAngle = -Math.PI / 2; // Start from top
      const expectedCenterAngle =
        expectedBaseAngle + categoryIndex * anglePerCategory;
      const normalizedExpectedAngle =
        (expectedCenterAngle + 2 * Math.PI) % (2 * Math.PI);

      // 5. Verify the point is within the correct angle range (allowing for random placement)
      const halfCategoryAngle = anglePerCategory / 2;
      let angleDiff = Math.abs(normalizedPointAngle - normalizedExpectedAngle);
      // Handle angle wrap-around
      if (angleDiff > Math.PI) {
        angleDiff = 2 * Math.PI - angleDiff;
      }
      expect(angleDiff).toBeLessThanOrEqual(halfCategoryAngle);

      // 6. Verify radius is in correct range for Unlikely likelihood
      const likelihoods = Object.values(Likelihood).reverse();
      const likelihoodIndex = likelihoods.indexOf(Likelihood.Unlikely);
      const ringWidth = 400 / likelihoods.length;

      const expectedOuterRadius = 400 - likelihoodIndex * ringWidth;
      const expectedInnerRadius = expectedOuterRadius - ringWidth;

      // Allow for the random offset in radius checks
      const maxRandomOffset = ringWidth * 0.25; // Half of the 0.5 multiplier used in the implementation
      expect(radius).toBeGreaterThanOrEqual(
        expectedInnerRadius - maxRandomOffset,
      );
      expect(radius).toBeLessThanOrEqual(expectedOuterRadius + maxRandomOffset);
    });
  });
});
