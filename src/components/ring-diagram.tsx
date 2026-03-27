"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import {
  useDiagramStore,
  coordinatesToCategoryAndLikelihood,
} from "../store/use-diagram-store";
import { Category, Preparedness, Relevance, Likelihood, Point } from "../types";
import { RING_COLORS, PREPAREDNESS_COLORS } from "../constants/colors";
import { useResponsiveSize } from "../hooks/use-responsive-size";

export const RingDiagram = () => {
  const svgReference = useRef<SVGSVGElement>(null);
  const {
    points,
    selectedPoint,
    selectPoint,
    updatePoint,
    addPointAtPosition,
  } = useDiagramStore();
  const size = useResponsiveSize();

  // Keep a ref to selectedPoint so event handlers always read the latest value
  // without needing selectedPoint in the structural render effect's dependency array.
  const selectedPointReference = useRef(selectedPoint);
  selectedPointReference.current = selectedPoint;

  /**
   * Memoises all geometry constants derived from `size` so they are computed
   * once per resize rather than repeated across both render effects.
   */
  const ringGeometry = useMemo(() => {
    if (size === 0) return;
    const marginAdjusted = size * 0.08;
    const diagramRadius = size / 2 - marginAdjusted;
    const categories = Object.values(Category);
    const likelihoods = Object.values(Likelihood).toReversed();
    const ringWidth = diagramRadius / likelihoods.length;
    const angleStep = (2 * Math.PI) / categories.length;
    return { size, diagramRadius, categories, likelihoods, ringWidth, angleStep };
  }, [size]);

  /**
   * Updates stroke and opacity on existing point circles to reflect the current selection.
   * Separated from the structural render so that a selection change avoids a full SVG rebuild.
   */
  const applySelectionHighlight = useCallback(
    (
      svgElement: SVGSVGElement,
      selected: string | undefined,
    ) => {
      d3.select(svgElement)
        .selectAll<SVGCircleElement, unknown>("circle.point")
        .attr("stroke", function () {
          return this.dataset["pointId"] === selected
            ? "var(--highlight)"
            : "none";
        })
        .attr("opacity", function () {
          const pointId = this.dataset["pointId"];
          return selected && pointId !== selected ? 0.6 : 1;
        });
    },
    [],
  );

  // Cheap effect: only update selection visuals without rebuilding the SVG
  useEffect(() => {
    if (!svgReference.current) return;
    applySelectionHighlight(svgReference.current, selectedPoint);
  }, [selectedPoint, applySelectionHighlight]);

  /**
   * Static structure effect: draws the background, rings, and category labels.
   * Only re-runs when `size` changes (via `ringGeometry`), so adding or editing
   * a point does not trigger a ring redraw.
   */
  useEffect(() => {
    if (!svgReference.current || !ringGeometry) return;

    const { size: currentSize, diagramRadius, categories, likelihoods, ringWidth, angleStep } =
      ringGeometry;

    const svg = d3.select(svgReference.current);
    svg.selectAll(".diagram-structure").remove();

    svg.attr("viewBox", `-${currentSize / 2} -${currentSize / 2} ${currentSize} ${currentSize}`);

    const diagramGroup = svg.append("g").attr("class", "diagram-structure");

    /**
     * Handle clicks on the diagram background or ring segments to add a new point.
     */
    const handleDiagramClick = (event: Event) => {
      const clickedElement = event.target as Element;
      if (d3.select(clickedElement).classed("point")) return;
      const [x, y] = d3.pointer(event, diagramGroup.node());
      addPointAtPosition(x, y, currentSize);
    };

    // Background circle — deselects the current point when clicked directly
    diagramGroup
      .append("circle")
      .attr("r", currentSize / 2)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("click", (event) => {
        if (event.target === event.currentTarget) {
          selectPoint();
        }
      });

    // Rings and quadrant dividers
    for (const [index] of likelihoods.entries()) {
      const colorIndex = likelihoods.length - 1 - index;

      diagramGroup
        .append("circle")
        .attr("r", diagramRadius - index * ringWidth)
        .attr("fill", RING_COLORS[colorIndex].fill)
        .attr("fill-opacity", 1)
        .attr("stroke", RING_COLORS[colorIndex].stroke)
        .attr("stroke-width", currentSize < 500 ? 1 : 1.5)
        .style("cursor", "pointer")
        .on("click", handleDiagramClick);

      for (const [catIndex] of categories.entries()) {
        const angle = catIndex * angleStep;
        const innerRadius = diagramRadius - (index + 1) * ringWidth;
        const outerRadius = diagramRadius - index * ringWidth;

        diagramGroup
          .append("line")
          .attr("x1", Math.cos(angle) * innerRadius)
          .attr("y1", Math.sin(angle) * innerRadius)
          .attr("x2", Math.cos(angle) * outerRadius)
          .attr("y2", Math.sin(angle) * outerRadius)
          .attr("stroke", RING_COLORS[colorIndex].stroke)
          .attr("stroke-width", currentSize < 500 ? 0.8 : 1)
          .style("cursor", "pointer")
          .on("click", handleDiagramClick);
      }
    }

    // Category labels
    for (const [index, category] of categories.entries()) {
      const angle = index * angleStep + angleStep / 2 - Math.PI / 2;
      const labelRadius = diagramRadius + (currentSize < 500 ? 20 : 40);
      const x = Math.cos(angle) * labelRadius;
      const y = Math.sin(angle) * labelRadius;

      const displayText =
        currentSize < 500
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
        .attr("class", currentSize < 500 ? "font-medium" : "font-semibold")
        .attr("font-size", currentSize < 500 ? "0.65rem" : "0.875rem");
    }
  }, [ringGeometry, selectPoint, addPointAtPosition]);

  /**
   * Dynamic points effect: draws point circles with drag/click handlers.
   * Re-runs when `points` or `size` (via `ringGeometry`) changes, but does NOT
   * redraw the static ring structure.
   */
  useEffect(() => {
    if (!svgReference.current || !ringGeometry) return;

    const { size: currentSize, diagramRadius, categories, likelihoods, ringWidth, angleStep } =
      ringGeometry;

    const svg = d3.select(svgReference.current);
    const diagramGroup = svg.select<SVGGElement>("g.diagram-structure");
    if (diagramGroup.empty()) return;

    // Clear and redraw only the points layer
    diagramGroup.selectAll(".point-layer").remove();
    const pointsGroup = diagramGroup.append("g").attr("class", "point-layer");

    const MIN_POINT_SPACING = 2;
    const placedPoints: { x: number; y: number; size: number }[] = [];

    /**
     * Calculates a random position within the specified arc segment and ring.
     */
    const calculatePointPosition = (point: Point) => {
      const categoryIndex = categories.indexOf(point.category);
      const likelihoodIndex = likelihoods.indexOf(point.likelihood);
      const arcStart = categoryIndex * angleStep - Math.PI / 2;
      const arcEnd = (categoryIndex + 1) * angleStep - Math.PI / 2;
      const outerRadius = diagramRadius - likelihoodIndex * ringWidth;
      const innerRadius = diagramRadius - (likelihoodIndex + 1) * ringWidth;
      const randomAngle = arcStart + Math.random() * (arcEnd - arcStart);
      const randomRadius =
        innerRadius + Math.random() * (outerRadius - innerRadius);
      return { x: Math.cos(randomAngle) * randomRadius, y: Math.sin(randomAngle) * randomRadius };
    };

    for (const point of points) {
      const sizeScale = currentSize < 500 ? 0.7 : 1;
      const pointSize =
        point.relevance === Relevance.High
          ? 14 * sizeScale
          : (point.relevance === Relevance.Moderate
            ? 10 * sizeScale
            : 7 * sizeScale);

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

      const pointElement = pointsGroup
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
        .attr("stroke", "none")
        .attr("stroke-width", currentSize < 500 ? 2 : 3)
        .attr("cursor", "pointer")
        .attr("opacity", 1)
        .attr("data-point-id", point.id)
        .classed("point", true);

      // For mobile: Add larger touch target using the computed position
      if (currentSize < 500) {
        pointsGroup
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
          selectPoint(point.id);
          d3.select(this)
            .attr("stroke", "var(--highlight)")
            .attr("stroke-width", currentSize < 500 ? 3 : 4)
            .style("cursor", "grabbing");
        })
        .on("drag", function (event) {
          const [newX, newY] = d3.pointer(
            event,
            diagramGroup.node?.() || undefined,
          );
          d3.select(this).attr("cx", newX).attr("cy", newY);
        })
        .on("end", function (event) {
          const [finalX, finalY] = d3.pointer(
            event,
            diagramGroup.node?.() || undefined,
          );

          const result = coordinatesToCategoryAndLikelihood(
            finalX,
            finalY,
            currentSize,
          );

          if (result) {
            updatePoint(
              point.id,
              {
                x: finalX,
                y: finalY,
                category: result.category,
                likelihood: result.likelihood,
              },
              true,
            );
          } else {
            d3.select(this).attr("cx", pos.x).attr("cy", pos.y);
          }

          d3.select(this).style("cursor", "pointer");
        });

      pointElement
        .call(handleDrag)
        .on("mouseover", function () {
          d3.select(this)
            .attr("stroke", "var(--highlight)")
            .attr("stroke-width", currentSize < 500 ? 2 : 3)
            .attr("opacity", 1);
        })
        .on("mouseout", function () {
          if (selectedPointReference.current !== point.id) {
            d3.select(this)
              .attr("stroke", "none")
              .attr("opacity", selectedPointReference.current ? 0.6 : 1);
          }
        })
        .on("click", function (event) {
          if (event?.defaultPrevented) return;
          selectPoint(point.id);
        });

      pointElement.append("title").text(point.label);
    }

    applySelectionHighlight(svgReference.current, selectedPointReference.current);
  }, [points, ringGeometry, selectPoint, updatePoint, applySelectionHighlight]);

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
