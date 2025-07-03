import { useDiagramStore } from "../use-diagram-store";
import { Likelihood, Point, Preparedness, Relevance } from "../../types";
import { Category } from "../../types";
import {
  loadDiagramFromFile,
  saveDiagramToFile,
} from "../../utils/file-handlers";

// Mock file handlers
jest.mock("../../utils/file-handlers", () => ({
  loadDiagramFromFile: jest.fn(),
  saveDiagramToFile: jest.fn(),
}));

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

      it("should preserve exact position when preservePosition is true", () => {
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

        // Update category/likelihood but preserve position
        const updates = {
          category: Category.Economic,
          likelihood: Likelihood.Unlikely,
          x: 150, // Explicit new coordinates
          y: 250,
        };

        const { updatePoint } = useDiagramStore.getState();
        updatePoint(mockUUID, updates, true); // preservePosition = true

        const state = useDiagramStore.getState();
        expect(state.points[0].category).toBe(Category.Economic);
        expect(state.points[0].likelihood).toBe(Likelihood.Unlikely);
        // Position should be exactly as specified, not recalculated
        expect(state.points[0].x).toBe(150);
        expect(state.points[0].y).toBe(250);
      });

      it("should recalculate position when preservePosition is false (default)", () => {
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

        // Update category/likelihood without preservePosition
        const updates = {
          category: Category.Economic,
          likelihood: Likelihood.Unlikely,
          x: 150, // These coordinates should be ignored
          y: 250,
        };

        const { updatePoint } = useDiagramStore.getState();
        updatePoint(mockUUID, updates); // preservePosition defaults to false

        const state = useDiagramStore.getState();
        expect(state.points[0].category).toBe(Category.Economic);
        expect(state.points[0].likelihood).toBe(Likelihood.Unlikely);
        // Position should be recalculated, not the provided x/y
        expect(state.points[0].x).not.toBe(150);
        expect(state.points[0].y).not.toBe(250);
        expect(state.points[0].x).not.toBe(originalX);
        expect(state.points[0].y).not.toBe(originalY);
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
      selectPoint();

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
        expect(state.selectedPoint).toBeUndefined();
      });

      it("should maintain empty state when no data in localStorage", () => {
        mockLocalStorage.getItem.mockReturnValue();

        const { loadState } = useDiagramStore.getState();
        loadState();

        const state = useDiagramStore.getState();
        expect(state.points).toEqual([]);
        expect(state.selectedPoint).toBeUndefined();
      });
    });
  });

  describe("File Operations", () => {
    describe("saveDiagram", () => {
      it("should call saveDiagramToFile with current state", async () => {
        useDiagramStore.setState({ points: [mockPoint] });
        const { saveDiagram } = useDiagramStore.getState();

        await saveDiagram();
        expect(saveDiagramToFile).toHaveBeenCalledWith(
          expect.objectContaining({
            points: [mockPoint],
          }),
        );
      });

      it("should throw error if save fails", async () => {
        (saveDiagramToFile as jest.Mock).mockRejectedValue(
          new Error("Save failed"),
        );
        const { saveDiagram } = useDiagramStore.getState();

        await expect(saveDiagram()).rejects.toThrow("Save failed");
      });
    });

    describe("loadDiagram", () => {
      const mockExportData = {
        version: 1,
        points: [mockPoint],
        metadata: {
          createdAt: "2025-04-12T00:00:00.000Z",
          lastModifiedAt: "2025-04-12T00:00:00.000Z",
        },
      };

      it("should update state with loaded points", async () => {
        (loadDiagramFromFile as jest.Mock).mockResolvedValue(mockExportData);
        const { loadDiagram } = useDiagramStore.getState();

        await loadDiagram();
        const state = useDiagramStore.getState();
        expect(state.points).toEqual(mockExportData.points);
        expect(state.selectedPoint).toBeUndefined();
      });

      it("should handle AbortError silently", async () => {
        const abortError = new Error("User cancelled");
        abortError.name = "AbortError";
        (loadDiagramFromFile as jest.Mock).mockRejectedValue(abortError);

        const { loadDiagram } = useDiagramStore.getState();
        await loadDiagram();
        // State should remain unchanged
        expect(useDiagramStore.getState().points).toEqual([]);
      });

      it("should throw other errors", async () => {
        (loadDiagramFromFile as jest.Mock).mockRejectedValue(
          new Error("Load failed"),
        );
        const { loadDiagram } = useDiagramStore.getState();

        await expect(loadDiagram()).rejects.toThrow("Load failed");
      });
    });

    describe("importPoints", () => {
      it("should replace existing points and clear selection", () => {
        useDiagramStore.setState({
          points: [mockPoint],
          selectedPoint: mockPoint.id,
        });

        const newPoints = [{ ...mockPoint, id: "new-id", label: "New Point" }];

        const { importPoints } = useDiagramStore.getState();
        importPoints(newPoints);

        const state = useDiagramStore.getState();
        expect(state.points).toEqual(newPoints);
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
      const maxRandomOffset = ringWidth * 0.3; // A bit more tolerance for the random offset
      expect(radius).toBeGreaterThanOrEqual(
        expectedInnerRadius - maxRandomOffset,
      );
      expect(radius).toBeLessThanOrEqual(expectedOuterRadius + maxRandomOffset);
    });
  });

  describe("Click-to-place functionality", () => {
    beforeEach(() => {
      useDiagramStore.setState({ points: [], selectedPoint: undefined });
    });

    it("should add point at specific coordinates and derive category/likelihood", () => {
      const { addPointAtPosition } = useDiagramStore.getState();

      // Add a point in the technological quadrant (top), moderate likelihood area
      const x = 0; // Center of quadrant
      const y = -150; // Upper area (more likely)
      const size = 800;

      const success = addPointAtPosition(x, y, size, { label: "Test Point" });

      expect(success).toBe(true);

      const state = useDiagramStore.getState();
      expect(state.points).toHaveLength(1);

      const addedPoint = state.points[0];
      expect(addedPoint.x).toBe(x);
      expect(addedPoint.y).toBe(y);
      expect(addedPoint.label).toBe("Test Point");
      expect(addedPoint.category).toBe(Category.Technological);
      expect(addedPoint.relevance).toBe(Relevance.Moderate); // Default value
      expect(addedPoint.preparedness).toBe(Preparedness.ModeratelyPrepared); // Default value

      // The point should be selected after creation
      expect(state.selectedPoint).toBe(addedPoint.id);
    });

    it("should return false for coordinates outside diagram bounds", () => {
      const { addPointAtPosition } = useDiagramStore.getState();

      // Try to add a point outside the diagram
      const x = 500; // Way outside
      const y = 500;
      const size = 800;

      const success = addPointAtPosition(x, y, size);

      expect(success).toBe(false);

      const state = useDiagramStore.getState();
      expect(state.points).toHaveLength(0);
    });

    it("should correctly map coordinates to different categories and likelihoods", () => {
      const { addPointAtPosition } = useDiagramStore.getState();
      const size = 800;

      // Test Economic quadrant (right side)
      const economicX = 150;
      const economicY = 0;
      addPointAtPosition(economicX, economicY, size, {
        label: "Economic Test",
      });

      // Test Political quadrant (bottom)
      const politicalX = 0;
      const politicalY = 150;
      addPointAtPosition(politicalX, politicalY, size, {
        label: "Political Test",
      });

      // Test Social quadrant (left side)
      const socialX = -150;
      const socialY = 0;
      addPointAtPosition(socialX, socialY, size, { label: "Social Test" });

      const state = useDiagramStore.getState();
      expect(state.points).toHaveLength(3);

      // Check that points were assigned to correct categories
      const categories = state.points.map((p) => p.category);
      expect(categories).toContain(Category.Economic);
      expect(categories).toContain(Category.Political);
      expect(categories).toContain(Category.Social);
    });

    it("should accept custom point properties", () => {
      const { addPointAtPosition } = useDiagramStore.getState();

      const customData = {
        label: "Custom Point",
        relevance: Relevance.High,
        preparedness: Preparedness.HighlyPrepared,
      };

      const success = addPointAtPosition(0, -100, 800, customData);

      expect(success).toBe(true);

      const state = useDiagramStore.getState();
      const addedPoint = state.points[0];

      expect(addedPoint.label).toBe("Custom Point");
      expect(addedPoint.relevance).toBe(Relevance.High);
      expect(addedPoint.preparedness).toBe(Preparedness.HighlyPrepared);
    });
  });
});
