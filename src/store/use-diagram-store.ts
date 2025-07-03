import { create } from "zustand";
import { Point, DiagramState } from "../types";
import { Category, Likelihood, Relevance, Preparedness } from "../types";
import { saveDiagramToFile, loadDiagramFromFile } from "../utils/file-handlers";

function getDiagramDimensions(size = 800) {
  const marginAdjusted = size * 0.08;
  const diagramRadius = size / 2 - marginAdjusted;
  const categories = Object.values(Category);
  const likelihoods = Object.values(Likelihood).reverse();
  const ringWidth = diagramRadius / likelihoods.length;
  const angleStep = (2 * Math.PI) / categories.length;

  return {
    diagramRadius,
    categories,
    likelihoods,
    ringWidth,
    angleStep,
  };
}

/**
 * Calculate a random position for a point within its category and likelihood segment
 */
function calculateRandomPosition(point: Omit<Point, "id">) {
  const dims = getDiagramDimensions();
  const { categories, likelihoods, diagramRadius, angleStep, ringWidth } = dims;

  const categoryIndex = categories.indexOf(point.category);
  const likelihoodIndex = likelihoods.indexOf(point.likelihood);

  // Calculate the arc boundaries for the category
  const arcStart = categoryIndex * angleStep - Math.PI / 2;
  const arcEnd = (categoryIndex + 1) * angleStep - Math.PI / 2;

  // Calculate the ring boundaries for the likelihood
  const outerRadius = diagramRadius - likelihoodIndex * ringWidth;
  const innerRadius = diagramRadius - (likelihoodIndex + 1) * ringWidth;

  // Choose random values within the boundaries
  const randomAngle = arcStart + Math.random() * (arcEnd - arcStart);
  const randomRadius =
    innerRadius + Math.random() * (outerRadius - innerRadius);

  return {
    x: Math.cos(randomAngle) * randomRadius,
    y: Math.sin(randomAngle) * randomRadius,
  };
}

/**
 * Convert x,y coordinates to category and likelihood
 * This is the inverse of the positioning logic
 */
function coordinatesToCategoryAndLikelihood(
  x: number,
  y: number,
  size = 800,
): { category: Category; likelihood: Likelihood } | undefined {
  const dims = getDiagramDimensions(size);
  const { categories, likelihoods, diagramRadius, angleStep, ringWidth } = dims;

  // Calculate radius from center
  const radius = Math.hypot(x, y);

  // Check if the point is within the diagram bounds
  if (radius > diagramRadius || radius < 0) {
    return undefined;
  }

  // Calculate angle from coordinates
  let angle = Math.atan2(y, x);
  // Normalize angle to match our coordinate system (starting from top, going clockwise)
  angle = angle + Math.PI / 2;
  if (angle < 0) angle += 2 * Math.PI;
  if (angle >= 2 * Math.PI) angle -= 2 * Math.PI;

  // Determine category from angle
  const categoryIndex = Math.floor(angle / angleStep);
  const clampedCategoryIndex = Math.min(categoryIndex, categories.length - 1);
  const category = categories[clampedCategoryIndex];

  // Determine likelihood from radius
  const likelihoodIndex = Math.floor((diagramRadius - radius) / ringWidth);
  const clampedLikelihoodIndex = Math.min(
    Math.max(likelihoodIndex, 0),
    likelihoods.length - 1,
  );
  const likelihood = likelihoods[clampedLikelihoodIndex];

  return { category, likelihood };
}

/**
 * Store interface for managing diagram state and actions
 */
interface DiagramStore extends DiagramState {
  /** Add a new point to the diagram */
  addPoint: (point: Omit<Point, "id">) => void;
  /** Add a new point at specific coordinates, deriving category and likelihood from position */
  addPointAtPosition: (
    x: number,
    y: number,
    size: number,
    pointData?: Partial<
      Omit<Point, "id" | "x" | "y" | "category" | "likelihood">
    >,
  ) => boolean;
  /** Update an existing point's properties */
  updatePoint: (id: string, updates: Partial<Point>) => void;
  /** Remove a point from the diagram */
  removePoint: (id: string) => void;
  /** Select a point on the diagram */
  selectPoint: (id?: string) => void;
  /** Import points from file, replacing current points */
  importPoints: (points: Point[]) => void;
  /** Save current diagram to a file */
  saveDiagram: () => Promise<void>;
  /** Load diagram from a file */
  loadDiagram: () => Promise<void>;
  /** Save the current diagram state to localStorage */
  saveState: () => void;
  /** Load the diagram state from localStorage */
  loadState: () => void;
}

/**
 * Custom hook for managing the diagram state
 * Provides methods for adding, updating, removing, and selecting points,
 * as well as persisting the state to localStorage
 */
export const useDiagramStore = create<DiagramStore>((set, get) => ({
  points: [],
  selectedPoint: undefined,

  addPoint: (point) =>
    set((state) => {
      const pos = calculateRandomPosition(point);
      return {
        points: [
          ...state.points,
          {
            ...point,
            id: crypto.randomUUID(),
            x: pos.x,
            y: pos.y,
          },
        ],
      };
    }),

  addPointAtPosition: (x, y, size, pointData = {}) => {
    // Convert coordinates to category and likelihood
    const result = coordinatesToCategoryAndLikelihood(x, y, size);
    if (!result) {
      return false; // Invalid position, don't add point
    }

    const { category, likelihood } = result;
    const newPoint: Point = {
      id: crypto.randomUUID(),
      label: pointData.label || "",
      category,
      likelihood,
      relevance: pointData.relevance || Relevance.Moderate,
      preparedness: pointData.preparedness || Preparedness.ModeratelyPrepared,
      x,
      y,
    };

    set((state) => ({
      points: [...state.points, newPoint],
      selectedPoint: newPoint.id, // Select the newly added point
    }));

    return true; // Return true to indicate success
  },

  updatePoint: (id, updates) =>
    set((state) => {
      const existingPoint = state.points.find((p) => p.id === id);
      if (!existingPoint) return state;

      // Create updated point with new values
      const updatedPoint = { ...existingPoint, ...updates };

      // Only recalculate position if category or likelihood changed
      if (updates.category !== undefined || updates.likelihood !== undefined) {
        const dims = getDiagramDimensions();
        const { categories, likelihoods } = dims;

        const categoryIndex = categories.indexOf(updatedPoint.category);
        const likelihoodIndex = likelihoods.indexOf(updatedPoint.likelihood);

        // Calculate angle based on category index (starting from top, clockwise)
        const baseAngle = -Math.PI / 2; // Start from top
        const angle = baseAngle + categoryIndex * dims.angleStep;

        // Calculate radius based on likelihood
        // Add a small offset to ensure it's within the ring
        const outerRadius =
          dims.diagramRadius - likelihoodIndex * dims.ringWidth;
        const innerRadius = outerRadius - dims.ringWidth;
        const radius = (outerRadius + innerRadius) / 2;

        // Update coordinates with a small random offset to prevent overlap
        const randomOffset = (Math.random() - 0.5) * (dims.ringWidth * 0.5);
        updatedPoint.x = Math.cos(angle) * (radius + randomOffset);
        updatedPoint.y = Math.sin(angle) * (radius + randomOffset);
      }

      return {
        points: state.points.map((point) =>
          point.id === id ? updatedPoint : point,
        ),
      };
    }),

  removePoint: (id) =>
    set((state) => ({
      points: state.points.filter((point) => point.id !== id),
      selectedPoint:
        state.selectedPoint === id ? undefined : state.selectedPoint,
    })),

  selectPoint: (id) => set({ selectedPoint: id }),

  importPoints: (points) => set({ points, selectedPoint: undefined }),

  saveDiagram: async () => {
    try {
      const state = get();
      await saveDiagramToFile(state);
    } catch (error) {
      console.error("Failed to save diagram:", error);
      throw error;
    }
  },

  loadDiagram: async () => {
    try {
      const data = await loadDiagramFromFile();
      set({ points: data.points, selectedPoint: undefined });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Failed to load diagram:", error);
        throw error;
      }
    }
  },

  saveState: () => {
    const state = get();
    localStorage.setItem(
      "diagramState",
      JSON.stringify({
        points: state.points,
      }),
    );
  },

  loadState: () => {
    const savedState = localStorage.getItem("diagramState");
    if (savedState) {
      const { points } = JSON.parse(savedState);
      set({ points, selectedPoint: undefined });
    }
  },
}));
