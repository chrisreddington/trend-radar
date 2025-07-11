"use client";
import { useState, useEffect } from "react";
import { useDiagramStore } from "../store/use-diagram-store";
import { Category, Likelihood, Relevance, Preparedness, Point } from "../types";

export const ControlPanel = () => {
  const {
    points,
    selectedPoint,
    addPoint,
    updatePoint,
    removePoint,
    selectPoint,
  } = useDiagramStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingPoint, setEditingPoint] = useState<Point | undefined>();
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [newPoint, setNewPoint] = useState<Omit<Point, "id">>({
    label: "",
    category: Category.Technological,
    likelihood: Likelihood.Average,
    relevance: Relevance.Moderate,
    preparedness: Preparedness.ModeratelyPrepared,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (selectedPoint) {
      const point = points.find((p) => p.id === selectedPoint);
      if (
        point &&
        (!editingPoint ||
          editingPoint.id !== point.id ||
          (!isUserEditing &&
            (editingPoint.category !== point.category ||
              editingPoint.likelihood !== point.likelihood)))
      ) {
        // Update editingPoint when point data changes (e.g., after drag operations)
        // but don't reset user's active edits
        setEditingPoint({ ...point });
        setIsUserEditing(false);
      }
      // Don't auto-collapse when a point is selected - let user control panel state
    } else if (editingPoint) {
      setEditingPoint(undefined);
      setIsUserEditing(false);
    }
  }, [selectedPoint, points, editingPoint, isUserEditing]);

  const handleAddPoint = (event: React.FormEvent) => {
    event.preventDefault();
    addPoint(newPoint);
    setNewPoint({
      label: "",
      category: Category.Technological,
      likelihood: Likelihood.Average,
      relevance: Relevance.Moderate,
      preparedness: Preparedness.ModeratelyPrepared,
      x: 0,
      y: 0,
    });
  };

  const handleUpdatePoint = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedPoint && editingPoint) {
      const originalPoint = points.find((p) => p.id === selectedPoint);
      if (!originalPoint) return;

      // Check if category or likelihood changed
      const categoryChanged = editingPoint.category !== originalPoint.category;
      const likelihoodChanged =
        editingPoint.likelihood !== originalPoint.likelihood;

      // Only include fields that have actually changed
      const updates: Partial<Point> = {};
      if (editingPoint.label !== originalPoint.label)
        updates.label = editingPoint.label;
      if (categoryChanged) updates.category = editingPoint.category;
      if (likelihoodChanged) updates.likelihood = editingPoint.likelihood;
      if (editingPoint.relevance !== originalPoint.relevance)
        updates.relevance = editingPoint.relevance;
      if (editingPoint.preparedness !== originalPoint.preparedness)
        updates.preparedness = editingPoint.preparedness;

      // Preserve position if only non-spatial properties changed
      const preservePosition = !categoryChanged && !likelihoodChanged;

      updatePoint(selectedPoint, updates, preservePosition);
      setIsUserEditing(false);
    }
  };

  const handleLabelChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    isEditing: boolean,
  ) => {
    if (isEditing && editingPoint) {
      setEditingPoint({ ...editingPoint, label: event.target.value });
      setIsUserEditing(true);
    } else {
      setNewPoint({ ...newPoint, label: event.target.value });
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCloseEdit = () => {
    selectPoint();
    setEditingPoint(undefined);
    setIsUserEditing(false);
    // Keep the panel expanded when closing edit - user can manually collapse if needed
  };

  const handleDeletePoint = () => {
    if (selectedPoint) {
      removePoint(selectedPoint);
      // Keep the panel expanded when deleting point - user can manually collapse if needed
      selectPoint();
      setEditingPoint(undefined);
      setIsUserEditing(false);
    }
  };

  const commonInputClasses =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-blue-400 dark:focus:ring-blue-400";
  const commonSelectClasses = commonInputClasses;
  const commonButtonClasses =
    "w-full rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-400 cursor-pointer";
  const deleteButtonClasses =
    "w-full mt-4 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-400 cursor-pointer";

  const getLikelihoodFromValue = (value: number): Likelihood => {
    if (value >= 80) return Likelihood.HighlyLikely;
    if (value >= 60) return Likelihood.Likely;
    if (value >= 40) return Likelihood.Average;
    if (value >= 20) return Likelihood.Unlikely;
    return Likelihood.HighlyUnlikely;
  };

  const getValueFromLikelihood = (likelihood: Likelihood): number => {
    switch (likelihood) {
      case Likelihood.HighlyLikely: {
        return 100;
      }
      case Likelihood.Likely: {
        return 75;
      }
      case Likelihood.Average: {
        return 50;
      }
      case Likelihood.Unlikely: {
        return 25;
      }
      case Likelihood.HighlyUnlikely: {
        return 0;
      }
    }
  };

  const getRelevanceFromValue = (value: number): Relevance => {
    if (value >= 66) return Relevance.High;
    if (value >= 33) return Relevance.Moderate;
    return Relevance.Low;
  };

  const getValueFromRelevance = (relevance: Relevance): number => {
    switch (relevance) {
      case Relevance.High: {
        return 100;
      }
      case Relevance.Moderate: {
        return 50;
      }
      case Relevance.Low: {
        return 0;
      }
    }
  };

  const getPreparednessFromValue = (value: number): Preparedness => {
    if (value >= 66) return Preparedness.HighlyPrepared;
    if (value >= 33) return Preparedness.ModeratelyPrepared;
    return Preparedness.InadequatelyPrepared;
  };

  const getValueFromPreparedness = (preparedness: Preparedness): number => {
    switch (preparedness) {
      case Preparedness.HighlyPrepared: {
        return 100;
      }
      case Preparedness.ModeratelyPrepared: {
        return 50;
      }
      case Preparedness.InadequatelyPrepared: {
        return 0;
      }
    }
  };

  const renderPointForm = (
    point: Point | Omit<Point, "id">,
    onSubmit: (event: React.FormEvent) => void,
    submitLabel: string,
    isEditing: boolean = false,
  ) => (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
      data-testid="add-point-form"
    >
      <div>
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          htmlFor={isEditing ? "edit-point-label" : "point-label"}
        >
          Label
        </label>
        <input
          id={isEditing ? "edit-point-label" : "point-label"}
          type="text"
          name="label"
          value={point.label}
          onChange={(event) => handleLabelChange(event, isEditing)}
          className={commonInputClasses}
          required
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          htmlFor={isEditing ? "edit-point-category" : "point-category"}
        >
          Category
        </label>
        <select
          id={isEditing ? "edit-point-category" : "point-category"}
          name="category"
          value={point.category}
          onChange={(event) =>
            isEditing && editingPoint
              ? (() => {
                  setEditingPoint({
                    ...editingPoint,
                    category: event.target.value as Category,
                  });
                  setIsUserEditing(true);
                })()
              : setNewPoint({
                  ...newPoint,
                  category: event.target.value as Category,
                })
          }
          className={commonSelectClasses}
          role="combobox"
          aria-label="Category"
        >
          {Object.values(Category).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          htmlFor={isEditing ? "edit-point-likelihood" : "point-likelihood"}
        >
          Likelihood: {point.likelihood}
        </label>
        <input
          id={isEditing ? "edit-point-likelihood" : "point-likelihood"}
          type="range"
          min="0"
          max="100"
          value={getValueFromLikelihood(point.likelihood)}
          onChange={(event) => {
            const newValue = getLikelihoodFromValue(Number(event.target.value));
            if (isEditing && editingPoint) {
              setEditingPoint({ ...editingPoint, likelihood: newValue });
              setIsUserEditing(true);
            } else {
              setNewPoint({ ...newPoint, likelihood: newValue });
            }
          }}
          data-testid="likelihood-slider"
          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          aria-label="Likelihood"
          aria-valuenow={getValueFromLikelihood(point.likelihood)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          htmlFor={isEditing ? "edit-point-relevance" : "point-relevance"}
        >
          Relevance: {point.relevance}
        </label>
        <input
          id={isEditing ? "edit-point-relevance" : "point-relevance"}
          type="range"
          min="0"
          max="100"
          value={getValueFromRelevance(point.relevance)}
          onChange={(event) => {
            const newValue = getRelevanceFromValue(Number(event.target.value));
            if (isEditing && editingPoint) {
              setEditingPoint({ ...editingPoint, relevance: newValue });
              setIsUserEditing(true);
            } else {
              setNewPoint({ ...newPoint, relevance: newValue });
            }
          }}
          data-testid="relevance-slider"
          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          aria-label="Relevance"
          aria-valuenow={getValueFromRelevance(point.relevance)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          htmlFor={isEditing ? "edit-point-preparedness" : "point-preparedness"}
        >
          Preparedness: {point.preparedness}
        </label>
        <input
          id={isEditing ? "edit-point-preparedness" : "point-preparedness"}
          type="range"
          min="0"
          max="100"
          value={getValueFromPreparedness(point.preparedness)}
          onChange={(event) => {
            const newValue = getPreparednessFromValue(
              Number(event.target.value),
            );
            if (isEditing && editingPoint) {
              setEditingPoint({ ...editingPoint, preparedness: newValue });
              setIsUserEditing(true);
            } else {
              setNewPoint({ ...newPoint, preparedness: newValue });
            }
          }}
          data-testid="preparedness-slider"
          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          aria-label="Preparedness"
          aria-valuenow={getValueFromPreparedness(point.preparedness)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <button type="submit" className={commonButtonClasses}>
        {submitLabel}
      </button>
    </form>
  );

  return (
    <div className="w-full lg:w-80 bg-white shadow-lg rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Points Management
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
            onClick={toggleCollapse}
            aria-expanded={!isCollapsed}
            aria-label="Points Management Toggle"
          >
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
      </div>

      <div className={`${isCollapsed ? "hidden" : ""}`}>
        {/* Show edit section first when a point is selected */}
        {editingPoint && (
          <div className="p-6 pt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">
                Edit Selected Point
              </h3>
              <button
                onClick={handleCloseEdit}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                aria-label="Close edit panel"
              >
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
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            {renderPointForm(
              editingPoint,
              handleUpdatePoint,
              "Update Point",
              true,
            )}
            <button onClick={handleDeletePoint} className={deleteButtonClasses}>
              Delete Point
            </button>
          </div>
        )}

        {/* Show add new point section */}
        <div
          id="control-panel-content"
          data-testid="add-point-form-content"
          className={`p-6 ${editingPoint ? "pt-0 border-t border-gray-300 dark:border-gray-600" : "pt-0"}`}
        >
          <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">
            Add New Point
          </h3>
          <div>
            {renderPointForm(newPoint, handleAddPoint, "Add Point", false)}
          </div>
        </div>
      </div>
    </div>
  );
};
