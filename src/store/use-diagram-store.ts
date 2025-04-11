import { create } from "zustand";
import { Point, DiagramState } from "../types";
import { Category, Likelihood } from "../types";

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
 * Store interface for managing diagram state and actions
 */
interface DiagramStore extends DiagramState {
  /** Add a new point to the diagram */
  addPoint: (point: Omit<Point, "id">) => void;
  /** Update an existing point's properties */
  updatePoint: (id: string, updates: Partial<Point>) => void;
  /** Remove a point from the diagram */
  removePoint: (id: string) => void;
  /** Select a point on the diagram */
  selectPoint: (id: string | undefined) => void;
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
