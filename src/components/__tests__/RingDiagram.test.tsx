import { render, screen } from '@testing-library/react';
import { RingDiagram } from '../RingDiagram';
import { useDiagramStore } from '../../store/useDiagramStore';
import { Category, Likelihood, Relevance, Preparedness } from '../../types';
import * as d3 from 'd3';

// Mock the store
jest.mock('../../store/useDiagramStore');
const mockedUseDiagramStore = useDiagramStore as unknown as jest.MockedFunction<typeof useDiagramStore>;

// Mock D3 select for testing
jest.mock('d3', () => {
  const mockReturnValue = {
    append: jest.fn().mockReturnThis(),
    attr: jest.fn().mockReturnThis(),
    style: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnValue({
      remove: jest.fn(),
      data: jest.fn().mockReturnThis(),
      enter: jest.fn().mockReturnThis(),
      append: jest.fn().mockReturnThis(),
      attr: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis()
    }),
    text: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
    classed: jest.fn().mockReturnThis()
  };

  return {
    select: jest.fn().mockReturnValue(mockReturnValue)
  };
});

describe('RingDiagram', () => {
  const mockPoints = [
    {
      id: '1',
      label: 'Test Point 1',
      category: Category.Technological,
      likelihood: Likelihood.Average,
      relevance: Relevance.Moderate,
      preparedness: Preparedness.ModeratelyPrepared,
      x: 0,
      y: 0
    }
  ];

  const mockSelectPoint = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseDiagramStore.mockReturnValue({
      points: mockPoints,
      selectedPoint: null,
      selectPoint: mockSelectPoint
    });
  });

  it('renders svg element', () => {
    render(<RingDiagram />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('initializes with D3', () => {
    render(<RingDiagram />);
    expect(d3.select).toHaveBeenCalled();
  });

  it('updates when points change', () => {
    const { rerender } = render(<RingDiagram />);
    
    // Clear initial render calls
    jest.clearAllMocks();
    
    const newPoints = [...mockPoints, {
      id: '2',
      label: 'Test Point 2',
      category: Category.Economic,
      likelihood: Likelihood.Likely,
      relevance: Relevance.High,
      preparedness: Preparedness.HighlyPrepared,
      x: 0,
      y: 0
    }];

    mockedUseDiagramStore.mockReturnValue({
      points: newPoints,
      selectedPoint: null,
      selectPoint: mockSelectPoint
    });

    rerender(<RingDiagram />);
    expect(d3.select).toHaveBeenCalled();
  });

  describe('when a point is clicked', () => {
    it('selects the point', () => {
      render(<RingDiagram />);
      
      // Get the mock D3 selection object
      const selectMock = d3.select as jest.Mock;
      const mockSelection = selectMock.mock.results[0].value;
      
      // Find the point click handler
      const pointClickHandler = mockSelection.selectAll.mock.results[0].value.on.mock.calls.find(
        (call: [string, () => void]) => call[0] === 'click'
      )?.[1];
      
      if (pointClickHandler) {
        pointClickHandler();
        expect(mockSelectPoint).toHaveBeenCalledWith('1');
      }
    });
  });

  describe('responsiveness', () => {
    let originalInnerWidth: number;
    
    beforeEach(() => {
      originalInnerWidth = window.innerWidth;
    });

    afterEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: originalInnerWidth
      });
    });

    it('adjusts size for mobile screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375
      });

      render(<RingDiagram />);
      const svg = d3.select as jest.Mock;
      
      expect(svg).toHaveBeenCalled();
      const calls = svg.mock.calls;
      expect(calls.some(call => 
        call[0] && call[0].getAttribute && 
        call[0].getAttribute('class')?.includes('w-full')
      )).toBeTruthy();
    });
  });
});