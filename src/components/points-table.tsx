"use client";
import { useMemo, useState } from "react";
import { useDiagramStore } from "../store/use-diagram-store";
import { Likelihood, Preparedness, Relevance } from "../types";

type SortField =
  | "label"
  | "category"
  | "relevance"
  | "preparedness"
  | "likelihood";
type SortDirection = "asc" | "desc";

/** Ordinal rank for Likelihood values (lower index = higher likelihood). */
const LIKELIHOOD_ORDER: Record<Likelihood, number> = {
  [Likelihood.HighlyLikely]: 0,
  [Likelihood.Likely]: 1,
  [Likelihood.Average]: 2,
  [Likelihood.Unlikely]: 3,
  [Likelihood.HighlyUnlikely]: 4,
};

/** Ordinal rank for Relevance values (lower index = higher relevance). */
const RELEVANCE_ORDER: Record<Relevance, number> = {
  [Relevance.High]: 0,
  [Relevance.Moderate]: 1,
  [Relevance.Low]: 2,
};

/** Ordinal rank for Preparedness values (lower index = more prepared). */
const PREPAREDNESS_ORDER: Record<Preparedness, number> = {
  [Preparedness.HighlyPrepared]: 0,
  [Preparedness.ModeratelyPrepared]: 1,
  [Preparedness.InadequatelyPrepared]: 2,
};

export const PointsTable = () => {
  const points = useDiagramStore((state) => state.points);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sortField, setSortField] = useState<SortField>("label");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedPoints = useMemo(
    () =>
      points.toSorted((a, b) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        switch (sortField) {
          case "likelihood": {
            return (
              (LIKELIHOOD_ORDER[a.likelihood] -
                LIKELIHOOD_ORDER[b.likelihood]) *
              direction
            );
          }
          case "relevance": {
            return (
              (RELEVANCE_ORDER[a.relevance] - RELEVANCE_ORDER[b.relevance]) *
              direction
            );
          }
          case "preparedness": {
            return (
              (PREPAREDNESS_ORDER[a.preparedness] -
                PREPAREDNESS_ORDER[b.preparedness]) *
              direction
            );
          }
          default: {
            return (
              a[sortField]
                .toLowerCase()
                .localeCompare(b[sortField].toLowerCase()) * direction
            );
          }
        }
      }),
    [points, sortField, sortDirection],
  );

  return (
    <div className="w-full bg-white shadow-lg rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 mt-6">
      <div className="p-4">
        <button
          className="w-full p-4 flex justify-between items-center cursor-pointer focus:outline-none"
          onClick={toggleCollapse}
          aria-expanded={!isCollapsed}
          aria-label="Points Table Toggle"
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Points Table
          </h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transform transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
      <div
        id="table-content"
        className={`p-6 pt-0 ${isCollapsed ? "hidden" : ""}`}
        data-testid="points-table-content"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("label")}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Label{" "}
                  {sortField === "label" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("category")}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Category{" "}
                  {sortField === "category" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("relevance")}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Relevance{" "}
                  {sortField === "relevance" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("preparedness")}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Preparedness{" "}
                  {sortField === "preparedness" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  onClick={() => handleSort("likelihood")}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Likelihood{" "}
                  {sortField === "likelihood" &&
                    (sortDirection === "asc" ? "↑" : "↓")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedPoints.map((point) => (
                <tr
                  key={point.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {point.label}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {point.category}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {point.relevance}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {point.preparedness}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {point.likelihood}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
