import { useDiagramStore } from '../useDiagramStore';
import { Likelihood, Point, Preparedness, Relevance } from '../../types';
import { Category } from '../../types';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock crypto.randomUUID
const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
global.crypto.randomUUID = jest.fn().mockReturnValue(mockUUID);

describe('useDiagramStore', () => {
  beforeEach(() => {
    // Clear the store state
    useDiagramStore.setState({ points: [], selectedPoint: null });
    // Clear localStorage mocks
    jest.clearAllMocks();
  });

  describe('addPoint', () => {
    it('should add a point with a generated UUID', () => {
      const newPoint: Omit<Point, 'id'> = {
        label: 'Test Point',
        category: Category.Technological,
        relevance: Relevance.High,
        preparedness: Preparedness.HighlyPrepared,
        likelihood: Likelihood.HighlyLikely,
        x: 0,
        y: 0
      };

      const { addPoint } = useDiagramStore.getState();
      addPoint(newPoint);

      const state = useDiagramStore.getState();
      expect(state.points).toHaveLength(1);
      expect(state.points[0]).toEqual({
        ...newPoint,
        id: mockUUID
      });
    });
  });

  describe('updatePoint', () => {
    it('should update an existing point', () => {
      // Add a point first
      const point = {
        id: mockUUID,
        label: 'Test Point',
        category: Category.Technological,
        relevance: Relevance.High,
        preparedness: Preparedness.HighlyPrepared,
        likelihood: Likelihood.HighlyLikely,
        x: 0,
        y: 0
      };
      useDiagramStore.setState({ points: [point] });

      const updates = {
        label: 'Updated Point',
        relevance: Relevance.Low
      };

      const { updatePoint } = useDiagramStore.getState();
      updatePoint(mockUUID, updates);

      const state = useDiagramStore.getState();
      expect(state.points[0]).toEqual({
        ...point,
        ...updates
      });
    });

    it('should not update non-existent points', () => {
      const point = {
        id: mockUUID,
        label: 'Test Point',
        category: Category.Technological,
        relevance: Relevance.High,
        preparedness: Preparedness.HighlyPrepared,
        likelihood: Likelihood.HighlyLikely,
        x: 0,
        y: 0
      };
      useDiagramStore.setState({ points: [point] });

      const { updatePoint } = useDiagramStore.getState();
      updatePoint('non-existent-id', { label: 'Updated' });

      const state = useDiagramStore.getState();
      expect(state.points[0]).toEqual(point);
    });
  });

  describe('removePoint', () => {
    it('should remove a point and clear selection if it was selected', () => {
      const point = {
        id: mockUUID,
        label: 'Test Point',
        category: Category.Technological,
        relevance: Relevance.High,
        preparedness: Preparedness.HighlyPrepared,
        likelihood: Likelihood.HighlyLikely,
        x: 0,
        y: 0
      };
      useDiagramStore.setState({ points: [point], selectedPoint: mockUUID });

      const { removePoint } = useDiagramStore.getState();
      removePoint(mockUUID);

      const state = useDiagramStore.getState();
      expect(state.points).toHaveLength(0);
      expect(state.selectedPoint).toBeNull();
    });

    it('should keep selection if removed point was not selected', () => {
      const point = {
        id: mockUUID,
        label: 'Test Point',
        category: Category.Technological,
        relevance: Relevance.High,
        preparedness: Preparedness.HighlyPrepared,
        likelihood: Likelihood.HighlyLikely,
        x: 0,
        y: 0
      };
      useDiagramStore.setState({ points: [point], selectedPoint: 'other-id' });

      const { removePoint } = useDiagramStore.getState();
      removePoint(mockUUID);

      const state = useDiagramStore.getState();
      expect(state.points).toHaveLength(0);
      expect(state.selectedPoint).toBe('other-id');
    });
  });

  describe('selectPoint', () => {
    it('should set the selected point', () => {
      const { selectPoint } = useDiagramStore.getState();
      selectPoint(mockUUID);

      const state = useDiagramStore.getState();
      expect(state.selectedPoint).toBe(mockUUID);
    });

    it('should clear selection when null is passed', () => {
      useDiagramStore.setState({ selectedPoint: mockUUID });

      const { selectPoint } = useDiagramStore.getState();
      selectPoint(null);

      const state = useDiagramStore.getState();
      expect(state.selectedPoint).toBeNull();
    });
  });

  describe('saveState', () => {
    it('should save points to localStorage', () => {
      const point = {
        id: mockUUID,
        label: 'Test Point',
        category: Category.Technological,
        relevance: Relevance.High,
        preparedness: Preparedness.HighlyPrepared,
        likelihood: Likelihood.HighlyLikely,
        x: 0,
        y: 0
      };
      useDiagramStore.setState({ points: [point] });

      const { saveState } = useDiagramStore.getState();
      saveState();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'diagramState',
        JSON.stringify({ points: [point] })
      );
    });
  });

  describe('loadState', () => {
    it('should load points from localStorage and clear selection', () => {
      const point = {
        id: mockUUID,
        label: 'Test Point',
        category: 'Technological',
        relevance: 'High',
        preparedness: 'Highly Prepared',
        likelihood: 'Highly Likely',
        x: 0,
        y: 0
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ points: [point] }));

      const { loadState } = useDiagramStore.getState();
      loadState();

      const state = useDiagramStore.getState();
      expect(state.points).toEqual([point]);
      expect(state.selectedPoint).toBeNull();
    });

    it('should do nothing if no state in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { loadState } = useDiagramStore.getState();
      loadState();

      const state = useDiagramStore.getState();
      expect(state.points).toEqual([]);
      expect(state.selectedPoint).toBeNull();
    });
  });
});