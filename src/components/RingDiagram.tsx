"use client";
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useDiagramStore } from '../store/useDiagramStore';
import { Category, Preparedness, Relevance, Likelihood } from '../types';

export const RingDiagram = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { points, selectedPoint, selectPoint } = useDiagramStore();

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 800;
    const margin = 60;
    const radius = Math.min(width, height) / 2 - margin;

    // Clear existing SVG
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Get arrays of categories and likelihoods
    const categories = Object.values(Category);
    const likelihoods = Object.values(Likelihood).reverse(); // Reverse to have HighlyLikely on the outside
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
        .attr('fill-opacity', 0.5)  // Make the fill subtle
        .attr('stroke', ringColors[index].stroke)
        .attr('stroke-width', 1.5);

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
          .attr('stroke-width', 1);
      });
    });

    // Draw category labels with improved styling
    const angleStep = (2 * Math.PI) / categories.length;
    categories.forEach((category, i) => {
      const angle = (i * angleStep) + (angleStep / 2) - Math.PI / 2; // Start from top and offset by half step
      const labelRadius = radius + 60; // Increased from 30 to 60 to move labels further out
      const x = Math.cos(angle) * labelRadius;
      const y = Math.sin(angle) * labelRadius;

      svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(category)
        .attr('fill', 'var(--quadrant-label)')
        .attr('class', 'text-base font-semibold');
    });

    // Add likelihood labels on the right side with improved styling
    likelihoods.forEach((likelihood, index) => {
      const y = (-radius + (index * ringWidth) + (ringWidth / 2));
      
      svg.append('text')
        .attr('x', radius + 45)
        .attr('y', y)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'var(--text-secondary)')
        .attr('class', 'text-sm')
        .text(likelihood);
    });

    // Plot points with improved visual differentiation
    points.forEach(point => {
      // Calculate position based on category and likelihood
      const categoryIndex = categories.indexOf(point.category);
      const likelihoodIndex = likelihoods.indexOf(point.likelihood);
      
      // Calculate angle based on category (add half of segment to center in quadrant)
      const angle = (categoryIndex * angleStep) + (angleStep / 2) - Math.PI / 2;
      
      // Calculate radius based on likelihood
      const pointRadius = radius - (likelihoodIndex * ringWidth) - (ringWidth / 2);
      
      const pointX = Math.cos(angle) * pointRadius;
      const pointY = Math.sin(angle) * pointRadius;

      // Map relevance to point size with larger differences
      const size = point.relevance === Relevance.High ? 14 :
                   point.relevance === Relevance.Moderate ? 10 : 7;

      // Map preparedness to color using CSS variables
      const color = point.preparedness === Preparedness.HighlyPrepared ? 'var(--preparedness-high)' :
                   point.preparedness === Preparedness.ModeratelyPrepared ? 'var(--preparedness-moderate)' : 
                   'var(--preparedness-low)';

      // Create point with improved visual feedback
      const pointElement = svg.append('circle')
        .attr('cx', pointX)
        .attr('cy', pointY)
        .attr('r', size)
        .attr('fill', color)
        .attr('stroke', selectedPoint === point.id ? 'var(--highlight)' : 'none')
        .attr('stroke-width', 3)
        .attr('cursor', 'pointer')
        .attr('opacity', selectedPoint && selectedPoint !== point.id ? 0.6 : 1);

      // Add hover effects
      pointElement
        .on('mouseover', function() {
          d3.select(this)
            .attr('stroke', 'var(--highlight)')
            .attr('stroke-width', 3)
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

  }, [points, selectedPoint, selectPoint]);

  return (
    <div className="flex justify-center items-center p-4">
      <svg ref={svgRef} />
    </div>
  );
};