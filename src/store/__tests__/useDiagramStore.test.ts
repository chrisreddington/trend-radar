import { useDiagramStore } from '../useDiagramStore';
import { Likelihood, Point, Preparedness, Relevance } from '../../types';
import { Category } from '../../types';

describe('useDiagramStore', () => {
  // Set up test data and mocks
  const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockPoint: Point = {
    id: mockUUID,
    label: 'Test Point',
    category: Category.Technological,
    relevance: Relevance.High,
    preparedness: Preparedness.HighlyPrepared,
    likelihood: Likelihood.HighlyLikely,
    x: 0,
    y: 0
  };

  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(() => {
    // Reset store and mocks before each test
    useDiagramStore.setState({ points: [], selectedPoint: null });
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    global.crypto.randomUUID = jest.fn().mockReturnValue(mockUUID);
  });

  describe('Point Management', () => {
    describe('addPoint', () => {
      it('should generate UUID and add new point to store', () => {
        const newPoint = {
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
      beforeEach(() => {
        useDiagramStore.setState({ points: [mockPoint] });
      });

      it('should update specified properties of existing point', () => {
        const updates = {
          label: 'Updated Point',
          relevance: Relevance.Low
        };

        const { updatePoint } = useDiagramStore.getState();
        updatePoint(mockUUID, updates);

        const state = useDiagramStore.getState();
        expect(state.points[0]).toEqual({
          ...mockPoint,
          ...updates
        });
      });

      it('should not modify state when point ID does not exist', () => {
        const { updatePoint } = useDiagramStore.getState();
        updatePoint('non-existent-id', { label: 'Updated' });

        const state = useDiagramStore.getState();
        expect(state.points[0]).toEqual(mockPoint);
      });
    });

    describe('removePoint', () => {
      it('should remove point and clear selection if it was selected', () => {
        useDiagramStore.setState({ points: [mockPoint], selectedPoint: mockUUID });

        const { removePoint } = useDiagramStore.getState();
        removePoint(mockUUID);

        const state = useDiagramStore.getState();
        expect(state.points).toHaveLength(0);
        expect(state.selectedPoint).toBeNull();
      });

      it('should preserve selection when removing unselected point', () => {
        useDiagramStore.setState({ points: [mockPoint], selectedPoint: 'other-id' });

        const { removePoint } = useDiagramStore.getState();
        removePoint(mockUUID);

        const state = useDiagramStore.getState();
        expect(state.points).toHaveLength(0);
        expect(state.selectedPoint).toBe('other-id');
      });
    });
  });

  describe('Point Selection', () => {
    it('should update selected point ID', () => {
      const { selectPoint } = useDiagramStore.getState();
      selectPoint(mockUUID);

      const state = useDiagramStore.getState();
      expect(state.selectedPoint).toBe(mockUUID);
    });

    it('should clear selection when passing null', () => {
      useDiagramStore.setState({ selectedPoint: mockUUID });

      const { selectPoint } = useDiagramStore.getState();
      selectPoint(null);

      const state = useDiagramStore.getState();
      expect(state.selectedPoint).toBeNull();
    });
  });

  describe('Persistence', () => {
    describe('saveState', () => {
      it('should persist points to localStorage', () => {
        useDiagramStore.setState({ points: [mockPoint] });

        const { saveState } = useDiagramStore.getState();
        saveState();

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'diagramState',
          JSON.stringify({ points: [mockPoint] })
        );
      });
    });

    describe('loadState', () => {
      it('should restore points from localStorage and reset selection', () => {
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ points: [mockPoint] }));

        const { loadState } = useDiagramStore.getState();
        loadState();

        const state = useDiagramStore.getState();
        expect(state.points).toEqual([mockPoint]);
        expect(state.selectedPoint).toBeNull();
      });

      it('should maintain empty state when no data in localStorage', () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        const { loadState } = useDiagramStore.getState();
        loadState();

        const state = useDiagramStore.getState();
        expect(state.points).toEqual([]);
        expect(state.selectedPoint).toBeNull();
      });
    });
  });
});