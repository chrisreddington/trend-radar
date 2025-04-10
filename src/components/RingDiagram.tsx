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
    const margin = 40;
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

    // Create rings for each likelihood level
    likelihoods.forEach((_, index) => {
      // Draw the main ring circle
      svg.append('circle')
        .attr('r', radius - (index * ringWidth))
        .attr('fill', 'none')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1);

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
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 1);
      });
    });

    // Draw category labels
    const angleStep = (2 * Math.PI) / categories.length;
    categories.forEach((category, i) => {
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const labelRadius = radius + 20;
      const x = Math.cos(angle) * labelRadius;
      const y = Math.sin(angle) * labelRadius;

      svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(category)
        .attr('class', 'text-sm font-medium');
    });

    // Add likelihood labels on the right side
    likelihoods.forEach((likelihood, index) => {
      const y = (-radius + (index * ringWidth) + (ringWidth / 2));
      
      svg.append('text')
        .attr('x', radius + 40)
        .attr('y', y)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'text-xs text-gray-600')
        .text(likelihood);
    });

    // Plot points
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

      // Map relevance to point size
      const size = point.relevance === Relevance.High ? 12 :
                   point.relevance === Relevance.Moderate ? 8 : 6;

      // Map preparedness to color
      const color = point.preparedness === Preparedness.HighlyPrepared ? '#22c55e' :
                   point.preparedness === Preparedness.ModeratelyPrepared ? '#eab308' : '#ef4444';

      svg.append('circle')
        .attr('cx', pointX)
        .attr('cy', pointY)
        .attr('r', size)
        .attr('fill', color)
        .attr('stroke', selectedPoint === point.id ? '#000' : 'none')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .on('click', () => selectPoint(point.id))
        .append('title')
        .text(point.label);
    });

  }, [points, selectedPoint, selectPoint]);

  return (
    <div className="flex justify-center items-center p-4">
      <svg ref={svgRef} />
    </div>
  );
};