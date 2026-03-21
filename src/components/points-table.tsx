"use client";
import { useMemo, useState } from "react";
import { useDiagramStore } from "../store/use-diagram-store";
import { Category } from "../types";

type SortField =
  | "label"
  | "category"
  | "relevance"
  | "preparedness"
  | "likelihood";
type SortDirection = "asc" | "desc";

const ALL_CATEGORIES = "All" as const;
type CategoryFilter = Category | typeof ALL_CATEGORIES;

export const PointsTable = () => {
  const points = useDiagramStore((state) => state.points);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sortField, setSortField] = useState<SortField>("label");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [labelSearch, setLabelSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>(ALL_CATEGORIES);

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

  const clearFilters = () => {
    setLabelSearch("");
    setCategoryFilter(ALL_CATEGORIES);
  };

  const isFiltered =
    labelSearch !== "" || categoryFilter !== ALL_CATEGORIES;

  const filteredAndSortedPoints = useMemo(() => {
    const searchTerm = labelSearch.toLowerCase();
    const filtered = points.filter((point) => {
      const matchesLabel = point.label.toLowerCase().includes(searchTerm);
      const matchesCategory =
        categoryFilter === ALL_CATEGORIES ||
        point.category === categoryFilter;
      return matchesLabel && matchesCategory;
    });

    return filtered.toSorted((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();
      return aValue.localeCompare(bValue) * direction;
    });
  }, [points, sortField, sortDirection, labelSearch, categoryFilter]);

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
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <input
            type="search"
            value={labelSearch}
            onChange={(event) => setLabelSearch(event.target.value)}
            placeholder="Search by label…"
            aria-label="Search points by label"
            className="flex-1 min-w-[160px] px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as CategoryFilter)
            }
            aria-label="Filter by category"
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={ALL_CATEGORIES}>All categories</option>
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Clear filters"
            >
              Clear
            </button>
          )}
          {isFiltered && (
            <span
              className="text-sm text-gray-500 dark:text-gray-400"
              aria-live="polite"
            >
              {filteredAndSortedPoints.length} of {points.length} shown
            </span>
          )}
        </div>
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
              {filteredAndSortedPoints.length === 0 ? (
                isFiltered ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-sm text-center text-gray-500 dark:text-gray-400"
                    >
                      No points match the current filters.
                    </td>
                  </tr>
                ) : null
              ) : (
                filteredAndSortedPoints.map((point) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
