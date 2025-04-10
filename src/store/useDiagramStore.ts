import { create } from 'zustand';
import { Point, DiagramState } from '../types';

/**
 * Store interface for managing diagram state and actions
 */
interface DiagramStore extends DiagramState {
  /** Add a new point to the diagram */
  addPoint: (point: Omit<Point, 'id'>) => void;
  /** Update an existing point's properties */
  updatePoint: (id: string, updates: Partial<Point>) => void;
  /** Remove a point from the diagram */
  removePoint: (id: string) => void;
  /** Select a point on the diagram */
  selectPoint: (id: string | null) => void;
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
  selectedPoint: null,

  addPoint: (point) => set((state) => ({
    points: [...state.points, { ...point, id: crypto.randomUUID() }]
  })),

  updatePoint: (id, updates) => set((state) => ({
    points: state.points.map(point => 
      point.id === id ? { ...point, ...updates } : point
    )
  })),

  removePoint: (id) => set((state) => ({
    points: state.points.filter(point => point.id !== id),
    selectedPoint: state.selectedPoint === id ? null : state.selectedPoint
  })),

  selectPoint: (id) => set({ selectedPoint: id }),

  saveState: () => {
    const state = get();
    localStorage.setItem('diagramState', JSON.stringify({
      points: state.points
    }));
  },

  loadState: () => {
    const savedState = localStorage.getItem('diagramState');
    if (savedState) {
      const { points } = JSON.parse(savedState);
      set({ points, selectedPoint: null });
    }
  }
}));