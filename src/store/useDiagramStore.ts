import { create } from 'zustand';
import { Point, DiagramState } from '../types';

interface DiagramStore extends DiagramState {
  addPoint: (point: Omit<Point, 'id'>) => void;
  updatePoint: (id: string, updates: Partial<Point>) => void;
  removePoint: (id: string) => void;
  selectPoint: (id: string | null) => void;
  saveState: () => void;
  loadState: () => void;
}

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