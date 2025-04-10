import { render, screen, fireEvent, within } from '@testing-library/react';
import { Legend } from '../Legend';
import { Preparedness } from '../../types';
import { RING_COLORS } from '../../constants/colors';

describe('Legend', () => {
  it('renders all legend sections', () => {
    render(<Legend />);
    
    // Check main heading
    expect(screen.getByRole('heading', { name: 'Legend' })).toBeInTheDocument();
    
    // Check section headings
    expect(screen.getByRole('heading', { name: 'Size (Relevance)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Color (Preparedness)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Rings (Likelihood)' })).toBeInTheDocument();
  });

  it('renders all preparedness levels', () => {
    render(<Legend />);
    
    Object.values(Preparedness).forEach(preparedness => {
      expect(screen.getByText(preparedness)).toBeInTheDocument();
    });
  });

  it('renders all ring levels', () => {
    render(<Legend />);
    const likelihoodSection = screen.getByRole('heading', { name: 'Rings (Likelihood)' }).parentElement!;
    
    RING_COLORS.forEach(color => {
      expect(within(likelihoodSection).getByText(color.label)).toBeInTheDocument();
    });
  });

  it('can be collapsed and expanded', () => {
    render(<Legend />);
    
    const button = screen.getByRole('button', { name: 'Legend' });
    const content = screen.getByTestId('legend-content');

    // Initially visible
    expect(content).not.toHaveClass('hidden');
    
    // Click to collapse
    fireEvent.click(button);
    expect(content).toHaveClass('hidden');
    
    // Click to expand
    fireEvent.click(button);
    expect(content).not.toHaveClass('hidden');
  });

  it('displays help text', () => {
    render(<Legend />);
    
    expect(screen.getByText('Click on any point to view and edit its details.')).toBeInTheDocument();
    expect(screen.getByText('Points are positioned based on their category (quadrant) and likelihood (ring).')).toBeInTheDocument();
  });
});