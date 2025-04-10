"use client";
import { useState } from 'react';
import { useDiagramStore } from '../store/useDiagramStore';
import { Category, Likelihood, Relevance, Preparedness, Point } from '../types';

export const ControlPanel = () => {
  const { points, selectedPoint, addPoint, updatePoint, removePoint } = useDiagramStore();
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
    if (!selectedPoint || !selectedPointData) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      label: formData.get('label') as string,
      category: formData.get('category') as Category,
      likelihood: formData.get('likelihood') as Likelihood,
      relevance: formData.get('relevance') as Relevance,
      preparedness: formData.get('preparedness') as Preparedness,
    };
    
    updatePoint(selectedPoint, updates);
  };

  const renderPointForm = (
    point: Partial<Point>,
    onSubmit: (e: React.FormEvent) => void,
    submitLabel: string
  ) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Label</label>
        <input
          type="text"
          name="label"
          value={point.label || ''}
          onChange={e => setNewPoint({ ...newPoint, label: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          name="category"
          value={point.category}
          onChange={e => setNewPoint({ ...newPoint, category: e.target.value as Category })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {Object.values(Category).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Likelihood</label>
        <select
          name="likelihood"
          value={point.likelihood}
          onChange={e => setNewPoint({ ...newPoint, likelihood: e.target.value as Likelihood })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {Object.values(Likelihood).map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Relevance</label>
        <select
          name="relevance"
          value={point.relevance}
          onChange={e => setNewPoint({ ...newPoint, relevance: e.target.value as Relevance })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {Object.values(Relevance).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Preparedness</label>
        <select
          name="preparedness"
          value={point.preparedness}
          onChange={e => setNewPoint({ ...newPoint, preparedness: e.target.value as Preparedness })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {Object.values(Preparedness).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        {submitLabel}
      </button>
    </form>
  );

  return (
    <div className="w-80 p-4 bg-white shadow-lg rounded-lg space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Add New Point</h2>
        {renderPointForm(newPoint, handleAddPoint, 'Add Point')}
      </div>

      {selectedPointData && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Edit Selected Point</h2>
          {renderPointForm(selectedPointData, handleUpdatePoint, 'Update Point')}
          <button
            onClick={() => selectedPoint && removePoint(selectedPoint)}
            className="mt-4 w-full rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Delete Point
          </button>
        </div>
      )}
    </div>
  );
};