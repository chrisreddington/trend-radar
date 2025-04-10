import { render, screen, fireEvent, within } from '@testing-library/react';
import { ControlPanel } from '../ControlPanel';
import { useDiagramStore } from '../../store/useDiagramStore';
import { Category, Likelihood, Relevance, Preparedness } from '../../types';

// Mock the store
jest.mock('../../store/useDiagramStore');
const mockedUseDiagramStore = useDiagramStore as unknown as jest.MockedFunction<typeof useDiagramStore>;

describe('ControlPanel', () => {
  const mockPoint = {
    id: '1',
    label: 'Test Point',
    category: Category.Technological,
    likelihood: Likelihood.Average,
    relevance: Relevance.Moderate,
    preparedness: Preparedness.ModeratelyPrepared,
    x: 0,
    y: 0
  };

  const mockAddPoint = jest.fn();
  const mockUpdatePoint = jest.fn();
  const mockRemovePoint = jest.fn();
  const mockSelectPoint = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseDiagramStore.mockReturnValue({
      points: [mockPoint],
      selectedPoint: null,
      addPoint: mockAddPoint,
      updatePoint: mockUpdatePoint,
      removePoint: mockRemovePoint,
      selectPoint: mockSelectPoint,
      getSelectedPoint: () => mockPoint
    });
  });

  it('renders add point form', () => {
    render(<ControlPanel />);
    expect(screen.getByText('Add New Point')).toBeInTheDocument();
    expect(screen.getByLabelText('Label')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Point' })).toBeInTheDocument();
  });

  it('can be collapsed and expanded', () => {
    render(<ControlPanel />);
    const button = screen.getByRole('button', { name: 'Add New Point Toggle' });
    const content = screen.getByTestId('add-point-form-content');

    // Initially visible
    expect(content).not.toHaveClass('hidden');

    // Click to collapse
    fireEvent.click(button);
    expect(content).toHaveClass('hidden');

    // Click to expand
    fireEvent.click(button);
    expect(content).not.toHaveClass('hidden');
  });

  it('adds a new point when form is submitted', async () => {
    render(<ControlPanel />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText('Label'), {
      target: { value: 'New Point' }
    });
    
    // Submit form
    const addButton = screen.getByRole('button', { name: 'Add Point' });
    fireEvent.click(addButton);

    expect(mockAddPoint).toHaveBeenCalledWith(expect.objectContaining({
      label: 'New Point',
      category: Category.Technological,
      likelihood: Likelihood.Average,
      relevance: Relevance.Moderate,
      preparedness: Preparedness.ModeratelyPrepared
    }));
  });

  describe('when point is selected', () => {
    beforeEach(() => {
      mockedUseDiagramStore.mockReturnValue({
        points: [mockPoint],
        selectedPoint: '1',
        addPoint: mockAddPoint,
        updatePoint: mockUpdatePoint,
        removePoint: mockRemovePoint,
        selectPoint: mockSelectPoint,
        getSelectedPoint: () => mockPoint
      });
    });

    it('shows edit form for selected point', () => {
      render(<ControlPanel />);
      
      const editSection = screen.getByText('Edit Selected Point').closest('div')?.parentElement;
      const labelInput = within(editSection!).getByLabelText('Label') as HTMLInputElement;
      expect(labelInput.value).toBe('Test Point');
      
      expect(screen.getByRole('button', { name: 'Update Point' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete Point' })).toBeInTheDocument();
    });

    it('updates point when edit form is submitted', () => {
      render(<ControlPanel />);
      
      // Change label
      const editSection = screen.getByText('Edit Selected Point').closest('div')?.parentElement;
      const labelInput = within(editSection!).getByLabelText('Label');
      fireEvent.change(labelInput, {
        target: { value: 'Updated Point' }
      });
      
      // Submit form
      const updateButton = screen.getByRole('button', { name: 'Update Point' });
      fireEvent.click(updateButton);

      expect(mockUpdatePoint).toHaveBeenCalledWith('1', expect.objectContaining({
        label: 'Updated Point'
      }));
    });

    it('deletes point when delete button is clicked', () => {
      render(<ControlPanel />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Delete Point' }));
      
      expect(mockRemovePoint).toHaveBeenCalledWith('1');
    });

    it('closes edit panel when close button is clicked', () => {
      render(<ControlPanel />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Close edit panel' }));
      
      expect(mockSelectPoint).toHaveBeenCalledWith(null);
    });
  });
});