"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useDiagramStore } from '../store/useDiagramStore';
import { Category, Preparedness, Relevance, Likelihood } from '../types';

export const RingDiagram = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { points, selectedPoint, selectPoint } = useDiagramStore();
  const [size, setSize] = useState(800); // Default size
  
  // Handle responsive sizing based on viewport
  const updateSize = useCallback(() => {
    // Determine size based on viewport width
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    // For mobile, use nearly full viewport width
    // For tablets and up, cap at 800px
    const newSize = vw < 640 ? Math.min(vw - 40, 500) : Math.min(vw * 0.75, 800);
    setSize(newSize);
  }, []);
  
  // Set up event listeners for resize
  useEffect(() => {
    // Update size on first render
    updateSize();
    
    // Listen for window resize events
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [updateSize]);
  
  // Render diagram whenever size or data changes
  useEffect(() => {
    if (!svgRef.current || size === 0) return;
    
    const margin = size * 0.08; // Responsive margin
    const radius = (size / 2) - margin;
    
    // Clear existing SVG
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create SVG with explicit dimensions
    const svg = d3.select(svgRef.current)
      .attr('width', size)
      .attr('height', size)
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('style', 'max-width: 100%; height: auto;') // Ensure proper scaling
      .append('g')
      .attr('transform', `translate(${size / 2},${size / 2})`);
    
    // Get arrays of categories and likelihoods
    const categories = Object.values(Category);
    const likelihoods = Object.values(Likelihood).reverse();
    const ringWidth = radius / likelihoods.length;
    
    // Define ring colors from inside (darker) to outside (lighter)
    const ringColors = [
      { fill: '#1e3a8a', stroke: '#1e40af' },  // blue-900, blue-800
      { fill: '#1e40af', stroke: '#1d4ed8' },  // blue-800, blue-700
      { fill: '#1d4ed8', stroke: '#2563eb' },  // blue-700, blue-600
      { fill: '#2563eb', stroke: '#3b82f6' },  // blue-600, blue-500
      { fill: '#3b82f6', stroke: '#60a5fa' },  // blue-500, blue-400
    ];
    
    // Create rings for each likelihood level
    likelihoods.forEach((_, index) => {
      // Draw the main ring circle with fills and strokes
      svg.append('circle')
        .attr('r', radius - (index * ringWidth))
        .attr('fill', ringColors[index].fill)
        .attr('fill-opacity', 0.5)
        .attr('stroke', ringColors[index].stroke)
        .attr('stroke-width', size < 500 ? 1 : 1.5);
      
      // Draw quadrant lines
      const angleStep = (2 * Math.PI) / categories.length;
      categories.forEach((_, catIndex) => {
        const angle = catIndex * angleStep;
        const innerRadius = radius - ((index + 1) * ringWidth);
        const outerRadius = radius - (index * ringWidth);
        
        const startX = Math.cos(angle) * innerRadius;
        const startY = Math.sin(angle) * innerRadius;
        const endX = Math.cos(angle) * outerRadius;
        const endY = Math.sin(angle) * outerRadius;
        
        svg.append('line')
          .attr('x1', startX)
          .attr('y1', startY)
          .attr('x2', endX)
          .attr('y2', endY)
          .attr('stroke', ringColors[index].stroke)
          .attr('stroke-width', size < 500 ? 0.8 : 1);
      });
    });
    
    // Draw category labels with responsive styling
    const angleStep = (2 * Math.PI) / categories.length;
    categories.forEach((category, i) => {
      const angle = (i * angleStep) + (angleStep / 2) - Math.PI / 2;
      const labelRadius = radius + (size < 500 ? 20 : 40);
      const x = Math.cos(angle) * labelRadius;
      const y = Math.sin(angle) * labelRadius;
      
      const displayText = size < 500 ? 
        category.split(' ').map(word => word.substring(0, 3)).join(' ') : 
        category;
      
      svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(displayText)
        .attr('fill', 'var(--quadrant-label)')
        .attr('font-size', size < 500 ? '0.65rem' : '0.875rem')
        .attr('class', size < 500 ? 'font-medium' : 'font-semibold');
    });
    
    // Add likelihood labels with responsive positioning
    const showLabels = size >= 400;
    if (showLabels) {
      likelihoods.forEach((likelihood, index) => {
        const y = (-radius + (index * ringWidth) + (ringWidth / 2));
        
        svg.append('text')
          .attr('x', radius + (size < 500 ? 10 : 30))
          .attr('y', y)
          .attr('text-anchor', 'start')
          .attr('dominant-baseline', 'middle')
          .attr('fill', 'var(--text-secondary)')
          .attr('font-size', size < 500 ? '0.65rem' : '0.75rem')
          .text(likelihood);
      });
    }
    
    // Plot points with responsive sizing
    points.forEach(point => {
      const categoryIndex = categories.indexOf(point.category);
      const likelihoodIndex = likelihoods.indexOf(point.likelihood);
      
      const angle = (categoryIndex * angleStep) + (angleStep / 2) - Math.PI / 2;
      const pointRadius = radius - (likelihoodIndex * ringWidth) - (ringWidth / 2);
      
      const pointX = Math.cos(angle) * pointRadius;
      const pointY = Math.sin(angle) * pointRadius;
      
      const sizeScale = size < 500 ? 0.7 : 1;
      const pointSize = point.relevance === Relevance.High ? 14 * sizeScale :
                      point.relevance === Relevance.Moderate ? 10 * sizeScale : 
                      7 * sizeScale;
      
      const color = point.preparedness === Preparedness.HighlyPrepared ? 'var(--preparedness-high)' :
                   point.preparedness === Preparedness.ModeratelyPrepared ? 'var(--preparedness-moderate)' : 
                   'var(--preparedness-low)';
      
      // Create point
      const pointElement = svg.append('circle')
        .attr('cx', pointX)
        .attr('cy', pointY)
        .attr('r', pointSize)
        .attr('fill', color)
        .attr('stroke', selectedPoint === point.id ? 'var(--highlight)' : 'none')
        .attr('stroke-width', size < 500 ? 2 : 3)
        .attr('cursor', 'pointer')
        .attr('opacity', selectedPoint && selectedPoint !== point.id ? 0.6 : 1);
      
      // Add larger touch target for mobile
      if (size < 500) {
        svg.append('circle')
          .attr('cx', pointX)
          .attr('cy', pointY)
          .attr('r', Math.max(pointSize * 2, 20))
          .attr('fill', 'transparent')
          .attr('stroke', 'none')
          .attr('pointer-events', 'all')
          .style('cursor', 'pointer')
          .on('click', () => selectPoint(point.id));
      }
      
      // Regular hover effects
      pointElement
        .on('mouseover', function() {
          d3.select(this)
            .attr('stroke', 'var(--highlight)')
            .attr('stroke-width', size < 500 ? 2 : 3)
            .attr('opacity', 1);
        })
        .on('mouseout', function() {
          if (selectedPoint !== point.id) {
            d3.select(this)
              .attr('stroke', 'none')
              .attr('opacity', selectedPoint ? 0.6 : 1);
          }
        })
        .on('click', () => selectPoint(point.id));
      
      // Add tooltip
      pointElement.append('title')
        .text(point.label);
    });
    
  }, [points, selectedPoint, selectPoint, size]);
  
  return (
    <div className="flex justify-center items-center w-full">
      <div className="max-w-[800px] w-full">
        <svg 
          ref={svgRef} 
          className="w-full h-auto"
          style={{ display: 'block' }} // Ensure SVG is visible
        />
      </div>
    </div>
  );
};