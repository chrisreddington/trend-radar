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

  const getDefaultStore = (selectedPoint: string | null = null) => ({
    points: [mockPoint],
    selectedPoint,
    addPoint: mockAddPoint,
    updatePoint: mockUpdatePoint,
    removePoint: mockRemovePoint,
    selectPoint: mockSelectPoint,
    getSelectedPoint: () => mockPoint
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // set default state with no selected point initially
    mockedUseDiagramStore.mockReturnValue(getDefaultStore());
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

  describe('when adding a new point', () => {
    it('handles category change', () => {
      render(<ControlPanel />);
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: Category.Economic } });
      
      const form = screen.getByRole('form');
      fireEvent.submit(form);
      
      expect(mockAddPoint).toHaveBeenCalledWith(expect.objectContaining({
        category: Category.Economic
      }));
    });

    it('handles likelihood slider change', () => {
      render(<ControlPanel />);
      const slider = screen.getByRole('slider', { name: /Likelihood/ });
      fireEvent.change(slider, { target: { value: '90' } });
      
      const form = screen.getByRole('form');
      fireEvent.submit(form);
      
      expect(mockAddPoint).toHaveBeenCalledWith(expect.objectContaining({
        likelihood: Likelihood.HighlyLikely
      }));
    });

    it('handles relevance slider change', () => {
      render(<ControlPanel />);
      const slider = screen.getByRole('slider', { name: /Relevance/ });
      fireEvent.change(slider, { target: { value: '80' } });
      
      const form = screen.getByRole('form');
      fireEvent.submit(form);
      
      expect(mockAddPoint).toHaveBeenCalledWith(expect.objectContaining({
        relevance: Relevance.High
      }));
    });

    it('handles preparedness slider change', () => {
      render(<ControlPanel />);
      const slider = screen.getByRole('slider', { name: /Preparedness/ });
      fireEvent.change(slider, { target: { value: '80' } });
      
      const form = screen.getByRole('form');
      fireEvent.submit(form);
      
      expect(mockAddPoint).toHaveBeenCalledWith(expect.objectContaining({
        preparedness: Preparedness.HighlyPrepared
      }));
    });
  });

  describe('when point is selected', () => {
    beforeEach(() => {
      // override selectedPoint to simulate a selected point
      mockedUseDiagramStore.mockReturnValue(getDefaultStore('1'));
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

    it('handles category change in edit mode', () => {
      render(<ControlPanel />);
      const editSection = screen.getByText('Edit Selected Point').closest('div')?.parentElement;
      const select = within(editSection!).getByRole('combobox');
      fireEvent.change(select, { target: { value: Category.Economic } });
      
      const form = within(editSection!).getByRole('form');
      fireEvent.submit(form);
      
      expect(mockUpdatePoint).toHaveBeenCalledWith('1', expect.objectContaining({
        category: Category.Economic
      }));
    });

    it('handles likelihood slider change in edit mode', () => {
      render(<ControlPanel />);
      const editSection = screen.getByText('Edit Selected Point').closest('div')?.parentElement;
      const slider = within(editSection!).getByRole('slider', { name: /Likelihood/ });
      fireEvent.change(slider, { target: { value: '90' } });
      
      const form = within(editSection!).getByRole('form');
      fireEvent.submit(form);
      
      expect(mockUpdatePoint).toHaveBeenCalledWith('1', expect.objectContaining({
        likelihood: Likelihood.HighlyLikely
      }));
    });

    it('handles relevance slider change in edit mode', () => {
      render(<ControlPanel />);
      const editSection = screen.getByText('Edit Selected Point').closest('div')?.parentElement;
      const slider = within(editSection!).getByRole('slider', { name: /Relevance/ });
      fireEvent.change(slider, { target: { value: '80' } });
      
      const form = within(editSection!).getByRole('form');
      fireEvent.submit(form);
      
      expect(mockUpdatePoint).toHaveBeenCalledWith('1', expect.objectContaining({
        relevance: Relevance.High
      }));
    });

    it('handles preparedness slider change in edit mode', () => {
      render(<ControlPanel />);
      const editSection = screen.getByText('Edit Selected Point').closest('div')?.parentElement;
      const slider = within(editSection!).getByRole('slider', { name: /Preparedness/ });
      fireEvent.change(slider, { target: { value: '80' } });
      
      const form = within(editSection!).getByRole('form');
      fireEvent.submit(form);
      
      expect(mockUpdatePoint).toHaveBeenCalledWith('1', expect.objectContaining({
        preparedness: Preparedness.HighlyPrepared
      }));
    });
  });

  describe('value conversion functions', () => {
    it('converts likelihood values correctly', () => {
      render(<ControlPanel />);
      const likelihoodSlider = screen.getByRole('slider', { name: /Likelihood/ });

      // Test all likelihood ranges
      const testCases = [
        { value: '90', expected: Likelihood.HighlyLikely },
        { value: '70', expected: Likelihood.Likely },
        { value: '50', expected: Likelihood.Average },
        { value: '30', expected: Likelihood.Unlikely },
        { value: '10', expected: Likelihood.HighlyUnlikely }
      ];

      testCases.forEach(({ value, expected }) => {
        fireEvent.change(likelihoodSlider, { target: { value } });
        
        const form = screen.getByRole('form');
        fireEvent.submit(form);

        expect(mockAddPoint).toHaveBeenCalledWith(expect.objectContaining({
          likelihood: expected
        }));

        jest.clearAllMocks(); // Clear mock calls for next iteration
      });
    });

    it('converts relevance values correctly', () => {
      render(<ControlPanel />);
      const relevanceSlider = screen.getByRole('slider', { name: /Relevance/ });

      // Test all relevance ranges
      const testCases = [
        { value: '80', expected: Relevance.High },
        { value: '50', expected: Relevance.Moderate },
        { value: '20', expected: Relevance.Low }
      ];

      testCases.forEach(({ value, expected }) => {
        fireEvent.change(relevanceSlider, { target: { value } });
        
        const form = screen.getByRole('form');
        fireEvent.submit(form);

        expect(mockAddPoint).toHaveBeenCalledWith(expect.objectContaining({
          relevance: expected
        }));

        jest.clearAllMocks(); // Clear mock calls for next iteration
      });
    });

    it('converts preparedness values correctly', () => {
      render(<ControlPanel />);
      const preparednessSlider = screen.getByRole('slider', { name: /Preparedness/ });

      // Test all preparedness ranges
      const testCases = [
        { value: '80', expected: Preparedness.HighlyPrepared },
        { value: '50', expected: Preparedness.ModeratelyPrepared },
        { value: '20', expected: Preparedness.InadequatelyPrepared }
      ];

      testCases.forEach(({ value, expected }) => {
        fireEvent.change(preparednessSlider, { target: { value } });
        
        const form = screen.getByRole('form');
        fireEvent.submit(form);

        expect(mockAddPoint).toHaveBeenCalledWith(expect.objectContaining({
          preparedness: expected
        }));

        jest.clearAllMocks(); // Clear mock calls for next iteration
      });
    });
  });
});
