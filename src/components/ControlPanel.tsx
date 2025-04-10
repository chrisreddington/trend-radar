"use client";
import { useState } from 'react';
import { useDiagramStore } from '../store/useDiagramStore';
import { Category, Likelihood, Relevance, Preparedness, Point } from '../types';

export const ControlPanel = () => {
  const { points, selectedPoint, addPoint, updatePoint, removePoint } = useDiagramStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newPoint, setNewPoint] = useState<Omit<Point, 'id'>>({
    label: '',
    category: Category.Technological,
    likelihood: Likelihood.Average,
    relevance: Relevance.Moderate,
    preparedness: Preparedness.ModeratelyPrepared,
    x: 0,
    y: 0
  });

  const selectedPointData = selectedPoint ? points.find(p => p.id === selectedPoint) : null;

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    addPoint(newPoint);
    setNewPoint({
      label: '',
      category: Category.Technological,
      likelihood: Likelihood.Average,
      relevance: Relevance.Moderate,
      preparedness: Preparedness.ModeratelyPrepared,
      x: 0,
      y: 0
    });
  };

  const handleUpdatePoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPoint && selectedPointData) {
      updatePoint(selectedPoint, selectedPointData);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const commonInputClasses = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-blue-400 dark:focus:ring-blue-400";
  const commonSelectClasses = commonInputClasses;
  const commonButtonClasses = "w-full rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-400";

  const getLikelihoodFromValue = (value: number): Likelihood => {
    if (value >= 80) return Likelihood.HighlyLikely;
    if (value >= 60) return Likelihood.Likely;
    if (value >= 40) return Likelihood.Average;
    if (value >= 20) return Likelihood.Unlikely;
    return Likelihood.HighlyUnlikely;
  };

  const getValueFromLikelihood = (likelihood: Likelihood): number => {
    switch (likelihood) {
      case Likelihood.HighlyLikely: return 100;
      case Likelihood.Likely: return 75;
      case Likelihood.Average: return 50;
      case Likelihood.Unlikely: return 25;
      case Likelihood.HighlyUnlikely: return 0;
    }
  };

  const getRelevanceFromValue = (value: number): Relevance => {
    if (value >= 66) return Relevance.High;
    if (value >= 33) return Relevance.Moderate;
    return Relevance.Low;
  };

  const getValueFromRelevance = (relevance: Relevance): number => {
    switch (relevance) {
      case Relevance.High: return 100;
      case Relevance.Moderate: return 50;
      case Relevance.Low: return 0;
    }
  };

  const getPreparednessFromValue = (value: number): Preparedness => {
    if (value >= 66) return Preparedness.HighlyPrepared;
    if (value >= 33) return Preparedness.ModeratelyPrepared;
    return Preparedness.InadequatelyPrepared;
  };

  const getValueFromPreparedness = (preparedness: Preparedness): number => {
    switch (preparedness) {
      case Preparedness.HighlyPrepared: return 100;
      case Preparedness.ModeratelyPrepared: return 50;
      case Preparedness.InadequatelyPrepared: return 0;
    }
  };

  const renderPointForm = (point: Omit<Point, 'id'>, onSubmit: (e: React.FormEvent) => void, submitLabel: string) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1" htmlFor="point-label">
          Label
        </label>
        <input
          id="point-label"
          type="text"
          name="label"
          value={point.label || ''}
          onChange={e => setNewPoint({ ...newPoint, label: e.target.value })}
          className={commonInputClasses}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1" htmlFor="point-category">
          Category
        </label>
        <select
          id="point-category"
          name="category"
          value={point.category}
          onChange={e => setNewPoint({ ...newPoint, category: e.target.value as Category })}
          className={commonSelectClasses}
        >
          {Object.values(Category).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1" htmlFor="point-likelihood">
          Likelihood: {point.likelihood}
        </label>
        <input
          id="point-likelihood"
          type="range"
          min="0"
          max="100"
          value={getValueFromLikelihood(point.likelihood)}
          onChange={e => setNewPoint({ ...newPoint, likelihood: getLikelihoodFromValue(Number(e.target.value)) })}
          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1" htmlFor="point-relevance">
          Relevance: {point.relevance}
        </label>
        <input
          id="point-relevance"
          type="range"
          min="0"
          max="100"
          value={getValueFromRelevance(point.relevance)}
          onChange={e => setNewPoint({ ...newPoint, relevance: getRelevanceFromValue(Number(e.target.value)) })}
          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1" htmlFor="point-preparedness">
          Preparedness: {point.preparedness}
        </label>
        <input
          id="point-preparedness"
          type="range"
          min="0"
          max="100"
          value={getValueFromPreparedness(point.preparedness)}
          onChange={e => setNewPoint({ ...newPoint, preparedness: getPreparednessFromValue(Number(e.target.value)) })}
          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <button
        type="submit"
        className={commonButtonClasses}
      >
        {submitLabel}
      </button>
    </form>
  );

  return (
    <div className="w-full lg:w-80 bg-white shadow-lg rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="p-4 cursor-pointer" onClick={toggleCollapse}>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          <button 
            className="w-full flex justify-between items-center focus:outline-none" 
            aria-expanded={!isCollapsed}
            aria-controls="control-panel-content"
          >
            Add New Point
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
        </h2>
      </div>
      <div 
        id="control-panel-content"
        className={`p-6 pt-0 ${isCollapsed ? 'hidden' : ''}`}
      >
        <div className="space-y-6">
          <div>
            {renderPointForm(newPoint, handleAddPoint, 'Add Point')}
          </div>

          {selectedPointData && (
            <div className="border-t border-gray-300 pt-6 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-200">Edit Selected Point</h3>
              {renderPointForm(selectedPointData, handleUpdatePoint, 'Update Point')}
              <button
                onClick={() => selectedPoint && removePoint(selectedPoint)}
                className="w-full rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-400"
              >
                Delete Point
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};