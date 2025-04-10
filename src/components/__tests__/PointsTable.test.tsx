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

  const getColumnHeader = (columnName: string) => {
    return screen.getByRole('columnheader', {
      name: new RegExp(`^${columnName}( ↑| ↓)?$`)
    });
  };

  const testColumnSorting = (columnName: string, firstValue: string, secondValue: string) => {
    const getCellIndex = () => {
      const headers = screen.getAllByRole('columnheader');
      return headers.findIndex(header => header.textContent?.includes(columnName));
    };

    const getCellText = (row: HTMLTableRowElement, cellIndex: number) => 
      row.cells[cellIndex].textContent;

    // Initial click for ascending sort
    fireEvent.click(getColumnHeader(columnName));
    
    let sortedRows = screen.getAllByRole('row').slice(1) as HTMLTableRowElement[];
    const cellIndex = getCellIndex();
    expect(getCellText(sortedRows[0], cellIndex)).toBe(firstValue);
    expect(getCellText(sortedRows[1], cellIndex)).toBe(secondValue);
    expect(getColumnHeader(columnName)).toHaveTextContent(/↑$/);

    // Click again for descending sort
    fireEvent.click(getColumnHeader(columnName));
    
    sortedRows = screen.getAllByRole('row').slice(1) as HTMLTableRowElement[];
    expect(getCellText(sortedRows[0], cellIndex)).toBe(secondValue);
    expect(getCellText(sortedRows[1], cellIndex)).toBe(firstValue);
    expect(getColumnHeader(columnName)).toHaveTextContent(/↓$/);
  };

  it('sorts by label', () => {
    render(<PointsTable />);
    testColumnSorting('Label', 'Test Point 1', 'Test Point 2');
  });

  it('sorts by category', () => {
    render(<PointsTable />);
    testColumnSorting('Category', 'Economic', 'Technological');
  });

  it('sorts by relevance', () => {
    render(<PointsTable />);
    testColumnSorting('Relevance', 'High', 'Moderate');
  });

  it('sorts by preparedness', () => {
    render(<PointsTable />);
    testColumnSorting('Preparedness', 'Highly Prepared', 'Moderately Prepared');
  });

  it('sorts by likelihood', () => {
    render(<PointsTable />);
    testColumnSorting('Likelihood', 'Highly Likely', 'Likely');
  });

  it('changes sort field when clicking a different column', () => {
    render(<PointsTable />);
    
    // Start with label sort
    fireEvent.click(getColumnHeader('Label'));
    expect(getColumnHeader('Label')).toHaveTextContent(/↑$/);
    
    // Change to category sort - should start with ascending sort
    fireEvent.click(getColumnHeader('Category'));
    expect(getColumnHeader('Category')).toHaveTextContent(/↑$/);
    expect(getColumnHeader('Label')).toHaveTextContent(/^Label$/);
  });
});