"use client";
import { useState } from 'react';
import { useDiagramStore } from '../store/useDiagramStore';
import { Point } from '../types';

type SortField = 'label' | 'category' | 'relevance' | 'preparedness' | 'likelihood';
type SortDirection = 'asc' | 'desc';

export const PointsTable = () => {
  const { points } = useDiagramStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sortField, setSortField] = useState<SortField>('label');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPoints = [...points].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    const aValue = a[sortField].toLowerCase();
    const bValue = b[sortField].toLowerCase();
    return aValue > bValue ? direction : -direction;
  });

  return (
    <div className="w-full bg-white shadow-lg rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 mt-6">
      <div className="p-4 cursor-pointer" onClick={toggleCollapse}>
        <button
          className="w-full p-4 flex justify-between items-center cursor-pointer"
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
            className={`transform transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
      <div 
        id="table-content"
        className={`p-6 pt-0 ${isCollapsed ? 'hidden' : ''}`}
        data-testid="points-table-content"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th 
                  onClick={() => handleSort('label')}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Label {sortField === 'label' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('category')}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('relevance')}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Relevance {sortField === 'relevance' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('preparedness')}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Preparedness {sortField === 'preparedness' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('likelihood')}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Likelihood {sortField === 'likelihood' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedPoints.map((point) => (
                <tr key={point.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{point.label}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{point.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{point.relevance}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{point.preparedness}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{point.likelihood}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};