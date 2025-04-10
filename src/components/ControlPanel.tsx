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

  const renderPointForm = (point: Omit<Point, 'id'>, onSubmit: (e: React.FormEvent) => void, submitLabel: string) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="point-label">Label</label>
        <input
          id="point-label"
          type="text"
          name="label"
          value={point.label || ''}
          onChange={e => setNewPoint({ ...newPoint, label: e.target.value })}
          className="w-full rounded-md border border-ring-color bg-background px-3 py-2 text-sm text-text-primary shadow-sm focus:border-highlight focus:outline-none focus:ring-1 focus:ring-highlight"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="point-category">Category</label>
        <select
          id="point-category"
          name="category"
          value={point.category}
          onChange={e => setNewPoint({ ...newPoint, category: e.target.value as Category })}
          className="w-full rounded-md border border-ring-color bg-background px-3 py-2 text-sm text-text-primary shadow-sm focus:border-highlight focus:outline-none focus:ring-1 focus:ring-highlight"
        >
          {Object.values(Category).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="point-likelihood">Likelihood</label>
        <select
          id="point-likelihood"
          name="likelihood"
          value={point.likelihood}
          onChange={e => setNewPoint({ ...newPoint, likelihood: e.target.value as Likelihood })}
          className="w-full rounded-md border border-ring-color bg-background px-3 py-2 text-sm text-text-primary shadow-sm focus:border-highlight focus:outline-none focus:ring-1 focus:ring-highlight"
        >
          {Object.values(Likelihood).map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="point-relevance">Relevance</label>
        <select
          id="point-relevance"
          name="relevance"
          value={point.relevance}
          onChange={e => setNewPoint({ ...newPoint, relevance: e.target.value as Relevance })}
          className="w-full rounded-md border border-ring-color bg-background px-3 py-2 text-sm text-text-primary shadow-sm focus:border-highlight focus:outline-none focus:ring-1 focus:ring-highlight"
        >
          {Object.values(Relevance).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="point-preparedness">Preparedness</label>
        <select
          id="point-preparedness"
          name="preparedness"
          value={point.preparedness}
          onChange={e => setNewPoint({ ...newPoint, preparedness: e.target.value as Preparedness })}
          className="w-full rounded-md border border-ring-color bg-background px-3 py-2 text-sm text-text-primary shadow-sm focus:border-highlight focus:outline-none focus:ring-1 focus:ring-highlight"
        >
          {Object.values(Preparedness).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-highlight px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-highlight/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  );

  return (
    <div className="w-full lg:w-80 bg-panel-bg shadow-lg rounded-lg border border-panel-border">
      <div className="panel-header p-4" onClick={toggleCollapse}>
        <h2 className="text-lg font-semibold text-text-primary">
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
              className={`panel-header-icon ${isCollapsed ? 'rotated' : ''}`}
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </h2>
      </div>
      <div 
        id="control-panel-content"
        className={`collapsible-panel p-6 pt-0 ${isCollapsed ? 'collapsed' : ''}`}
      >
        <div className="space-y-6">
          <div>
            {renderPointForm(newPoint, handleAddPoint, 'Add Point')}
          </div>

          {selectedPointData && (
            <div className="border-t border-ring-color pt-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Edit Selected Point</h3>
              {renderPointForm(selectedPointData, handleUpdatePoint, 'Update Point')}
              <button
                onClick={() => selectedPoint && removePoint(selectedPoint)}
                className="mt-4 w-full rounded-md bg-preparedness-low px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-preparedness-low/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-preparedness-low transition-colors"
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