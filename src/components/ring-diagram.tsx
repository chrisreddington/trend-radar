"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import {
  useDiagramStore,
  coordinatesToCategoryAndLikelihood,
} from "../store/use-diagram-store";
import { Category, Preparedness, Relevance, Likelihood, Point } from "../types";
import { RING_COLORS, PREPAREDNESS_COLORS } from "../constants/colors";

export const RingDiagram = () => {
  const svgReference = useRef<SVGSVGElement>(null);
  const {
    points,
    selectedPoint,
    selectPoint,
    updatePoint,
    addPointAtPosition,
  } = useDiagramStore();
  const [size, setSize] = useState(800); // Default size

  // Handle responsive sizing based on viewport
  const updateSize = useCallback(() => {
    // Determine size based on viewport width
    const vw = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0,
    );
    // For mobile, use nearly full viewport width
    // For tablets and up, cap at 800px
    const newSize =
      vw < 640 ? Math.min(vw - 40, 500) : Math.min(vw * 0.75, 800);
    setSize(newSize);
  }, []);

  // Set up event listeners for resize
  useEffect(() => {
    // Update size on first render
    updateSize();

    // Listen for window resize events
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  // Render diagram whenever size or data changes
  useEffect(() => {
    if (!svgReference.current || size === 0) return;

    const svg = d3.select(svgReference.current);
    svg.selectAll("*").remove();

    // Set up diagram dimensions
    const width = size;
    const height = size;

    // Create main diagram group
    const diagramGroup = svg
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .append("g");

    /**
     * Handle clicks on the diagram to add points at specific coordinates
     */
    const handleDiagramClick = (event: Event) => {
      // Check if the click was directly on a ring element (not on a point)
      const clickedElement = event.target as Element;
      const isPointClick = d3.select(clickedElement).classed("point");

      if (isPointClick) {
        return; // Let point click handlers manage point selection
      }

      // Get mouse position relative to the diagram group
      const [x, y] = d3.pointer(event, diagramGroup.node());

      // Add point at the clicked coordinates
      addPointAtPosition(x, y, size);
    };

    // Add background for click handling
    diagramGroup
      .append("circle")
      .attr("r", width / 2)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("click", (event) => {
        // Only deselect if the click was directly on the background
        if (event.target === event.currentTarget) {
          selectPoint();
        }
      });

    const marginAdjusted = size * 0.08;
    const diagramRadius = size / 2 - marginAdjusted;

    const categories = Object.values(Category);
    const likelihoods = Object.values(Likelihood).toReversed();
    const ringWidth = diagramRadius / likelihoods.length;

    // Add a helper for random positioning with collision detection
    const MIN_POINT_SPACING = 2;
    const placedPoints: { x: number; y: number; size: number }[] = [];

    const angleStep = (2 * Math.PI) / categories.length;
    /**
     * Calculates a random position within the specified arc segment and ring.
     * @param point - The point being positioned.
     * @param pointSize - The computed size for the point.
     * @returns An object with x and y coordinates.
     */

    //
    const calculatePointPosition = (point: Point) => {
      const categoryIndex = categories.indexOf(point.category);
      const likelihoodIndex = likelihoods.indexOf(point.likelihood);
      // Apply offset so arc boundaries align with the label placement
      const arcStart = categoryIndex * angleStep - Math.PI / 2;
      const arcEnd = (categoryIndex + 1) * angleStep - Math.PI / 2;
      // Calculate ring boundaries
      const outerRadius = diagramRadius - likelihoodIndex * ringWidth;
      const innerRadius = diagramRadius - (likelihoodIndex + 1) * ringWidth;
      // Choose random values within the boundaries
      const randomAngle = arcStart + Math.random() * (arcEnd - arcStart);
      const randomRadius =
        innerRadius + Math.random() * (outerRadius - innerRadius);
      const x = Math.cos(randomAngle) * randomRadius;
      const y = Math.sin(randomAngle) * randomRadius;
      return { x, y };
    };

    // Create rings for each likelihood level
    for (const [index] of likelihoods.entries()) {
      const colorIndex = likelihoods.length - 1 - index;

      // Draw the main ring circle with fills, strokes, and click handler
      diagramGroup
        .append("circle")
        .attr("r", diagramRadius - index * ringWidth)
        .attr("fill", RING_COLORS[colorIndex].fill)
        .attr("fill-opacity", 1)
        .attr("stroke", RING_COLORS[colorIndex].stroke)
        .attr("stroke-width", size < 500 ? 1 : 1.5)
        .style("cursor", "pointer")
        .on("click", handleDiagramClick);

      // Draw quadrant lines
      const angleStep = (2 * Math.PI) / categories.length;
      for (const [catIndex] of categories.entries()) {
        const angle = catIndex * angleStep;
        const innerRadius = diagramRadius - (index + 1) * ringWidth;
        const outerRadius = diagramRadius - index * ringWidth;

        const startX = Math.cos(angle) * innerRadius;
        const startY = Math.sin(angle) * innerRadius;
        const endX = Math.cos(angle) * outerRadius;
        const endY = Math.sin(angle) * outerRadius;

        diagramGroup
          .append("line")
          .attr("x1", startX)
          .attr("y1", startY)
          .attr("x2", endX)
          .attr("y2", endY)
          .attr("stroke", RING_COLORS[colorIndex].stroke)
          .attr("stroke-width", size < 500 ? 0.8 : 1)
          .style("cursor", "pointer")
          .on("click", handleDiagramClick);
      }
    }

    // Draw category labels with responsive styling
    for (const [index, category] of categories.entries()) {
      const angle = index * angleStep + angleStep / 2 - Math.PI / 2;
      const labelRadius = diagramRadius + (size < 500 ? 20 : 40);
      const x = Math.cos(angle) * labelRadius;
      const y = Math.sin(angle) * labelRadius;

      const displayText =
        size < 500
          ? category
              .split(" ")
              .map((word) => word.slice(0, 3))
              .join(" ")
          : category;

      diagramGroup
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(displayText)
        .attr("fill", "currentColor")
        .attr("class", size < 500 ? "font-medium" : "font-semibold")
        .attr("font-size", size < 500 ? "0.65rem" : "0.875rem");
    }

    // Plot points with responsive sizing and random placement while avoiding overlaps
    for (const point of points) {
      // Determine point size based on relevance
      const sizeScale = size < 500 ? 0.7 : 1;
      const pointSize =
        point.relevance === Relevance.High
          ? 14 * sizeScale
          : (point.relevance === Relevance.Moderate
            ? 10 * sizeScale
            : 7 * sizeScale);

      // Use existing position if available, otherwise calculate a new one
      let pos: { x: number; y: number } =
        point.x !== 0 || point.y !== 0
          ? { x: point.x, y: point.y }
          : calculatePointPosition(point);
      if (point.x === 0 && point.y === 0) {
        let attempts = 0;
        const MAX_ATTEMPTS = 10;
        while (
          attempts < MAX_ATTEMPTS &&
          placedPoints.some(
            (existing) =>
              Math.hypot(existing.x - pos.x, existing.y - pos.y) <
              existing.size + pointSize + MIN_POINT_SPACING,
          )
        ) {
          pos = calculatePointPosition(point);
          attempts++;
        }
        // Record the computed position in the store so the point won't move on re-render.
        updatePoint(point.id, { ...point, x: pos.x, y: pos.y }, true);
      }
      placedPoints.push({ ...pos, size: pointSize });

      const pointElement = diagramGroup
        .append("circle")
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("r", pointSize)
        .attr(
          "fill",
          point.preparedness === Preparedness.HighlyPrepared
            ? PREPAREDNESS_COLORS.high
            : (point.preparedness === Preparedness.ModeratelyPrepared
              ? PREPAREDNESS_COLORS.moderate
              : PREPAREDNESS_COLORS.low),
        )
        .attr(
          "stroke",
          selectedPoint === point.id ? "var(--highlight)" : "none",
        )
        .attr("stroke-width", size < 500 ? 2 : 3)
        .attr("cursor", "pointer")
        .attr("opacity", selectedPoint && selectedPoint !== point.id ? 0.6 : 1)
        .classed("point", true);

      // For mobile: Add larger touch target using the computed position
      if (size < 500) {
        diagramGroup
          .append("circle")
          .attr("cx", pos.x)
          .attr("cy", pos.y)
          .attr("r", Math.max(pointSize * 2, 20))
          .attr("fill", "transparent")
          .attr("stroke", "none")
          .attr("pointer-events", "all")
          .style("cursor", "pointer")
          .on("click", () => selectPoint(point.id));
      }

      // Handle drag behavior for moving points
      const handleDrag = d3
        .drag<SVGCircleElement, unknown>()
        .on("start", function () {
          // Select the point when dragging starts
          selectPoint(point.id);
          // Add visual feedback during drag
          d3.select(this)
            .attr("stroke", "var(--highlight)")
            .attr("stroke-width", size < 500 ? 3 : 4)
            .style("cursor", "grabbing");
        })
        .on("drag", function (event) {
          // Update position during drag
          const [newX, newY] = d3.pointer(
            event,
            diagramGroup.node?.() || undefined,
          );
          d3.select(this).attr("cx", newX).attr("cy", newY);
        })
        .on("end", function (event) {
          // Get final position after drag
          const [finalX, finalY] = d3.pointer(
            event,
            diagramGroup.node?.() || undefined,
          );

          // Check if the position is within diagram bounds and convert to category/likelihood
          const result = coordinatesToCategoryAndLikelihood(
            finalX,
            finalY,
            size,
          );

          if (result) {
            // Update the point with exact position and derived category/likelihood
            // Use preservePosition flag to prevent automatic position recalculation
            updatePoint(
              point.id,
              {
                x: finalX,
                y: finalY,
                category: result.category,
                likelihood: result.likelihood,
              },
              true,
            ); // preservePosition = true
          } else {
            // If dropped outside bounds, revert to original position
            d3.select(this).attr("cx", pos.x).attr("cy", pos.y);
          }

          // Reset cursor
          d3.select(this).style("cursor", "pointer");
        });

      pointElement
        .call(handleDrag)
        .on("mouseover", function () {
          d3.select(this)
            .attr("stroke", "var(--highlight)")
            .attr("stroke-width", size < 500 ? 2 : 3)
            .attr("opacity", 1);
        })
        .on("mouseout", function () {
          if (selectedPoint !== point.id) {
            d3.select(this)
              .attr("stroke", "none")
              .attr("opacity", selectedPoint ? 0.6 : 1);
          }
        })
        .on("click", function (event) {
          // Only handle click if it wasn't a drag operation
          if (event?.defaultPrevented) return;
          selectPoint(point.id);
        });

      pointElement.append("title").text(point.label);
    }
  }, [
    points,
    selectedPoint,
    selectPoint,
    updatePoint,
    addPointAtPosition,
    size,
  ]);

  return (
    <div className="flex justify-center items-center w-full">
      <div className="max-w-[800px] w-full text-gray-900 dark:text-gray-100">
        <svg
          ref={svgReference}
          className="w-full h-auto"
          style={{ display: "block" }} // Ensure SVG is visible
          role="img"
          aria-label="Ring diagram showing points across different categories and rings"
        />
      </div>
    </div>
  );
};
