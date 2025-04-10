import { render, screen, fireEvent } from '@testing-library/react';
import { PointsTable } from '../PointsTable';
import { useDiagramStore } from '../../store/useDiagramStore';

// Mock the store
jest.mock('../../store/useDiagramStore');
const mockedUseDiagramStore = useDiagramStore as unknown as jest.MockedFunction<typeof useDiagramStore>;

describe('PointsTable', () => {
  const mockPoints = [
    {
      id: '1',
      label: 'Test Point 1',
      category: 'Technological',
      relevance: 'High',
      preparedness: 'Highly Prepared',
      likelihood: 'Highly Likely',
      x: 0,
      y: 0
    },
    {
      id: '2',
      label: 'Test Point 2',
      category: 'Economic',
      relevance: 'Moderate',
      preparedness: 'Moderately Prepared',
      likelihood: 'Likely',
      x: 0,
      y: 0
    }
  ];

  beforeEach(() => {
    mockedUseDiagramStore.mockReturnValue({
      points: mockPoints
    });
  });

  it('renders the table with points', () => {
    render(<PointsTable />);
    expect(screen.getByText('Points Table')).toBeInTheDocument();
    expect(screen.getByText('Test Point 1')).toBeInTheDocument();
    expect(screen.getByText('Test Point 2')).toBeInTheDocument();
  });

  it('can be collapsed and expanded', () => {
    render(<PointsTable />);
    const button = screen.getByRole('button', { name: 'Points Table Toggle' });
    const content = screen.getByRole('table').parentElement?.parentElement;

    expect(content).toBeInTheDocument();
    expect(content).not.toHaveClass('hidden');

    fireEvent.click(button);
    expect(content).toHaveClass('hidden');

    fireEvent.click(button);
    expect(content).not.toHaveClass('hidden');
  });

  it('sorts points when clicking on column headers', () => {
    render(<PointsTable />);
    
    // Initially sorted by label ascending
    const rows = screen.getAllByRole('row') as HTMLTableRowElement[];
    const getCellText = (row: HTMLTableRowElement, cellIndex: number) => 
      row.cells[cellIndex].textContent;

    // Click label header to sort descending
    fireEvent.click(screen.getByText('Label ↑'));
    
    let sortedRows = screen.getAllByRole('row').slice(1) as HTMLTableRowElement[]; // Skip header row
    expect(getCellText(sortedRows[0], 0)).toBe('Test Point 2');
    expect(getCellText(sortedRows[1], 0)).toBe('Test Point 1');

    // Click again to sort ascending
    fireEvent.click(screen.getByText('Label ↓'));
    
    sortedRows = screen.getAllByRole('row').slice(1) as HTMLTableRowElement[];
    expect(getCellText(sortedRows[0], 0)).toBe('Test Point 1');
    expect(getCellText(sortedRows[1], 0)).toBe('Test Point 2');
  });
});