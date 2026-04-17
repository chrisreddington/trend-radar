"use client";
import { memo, useCallback, useEffect, useState } from "react";
import { useDiagramStore } from "../store/use-diagram-store";
import { Category, Likelihood, Relevance, Preparedness, Point } from "../types";
import {
  getLikelihoodFromValue,
  getValueFromLikelihood,
  getRelevanceFromValue,
  getValueFromRelevance,
  getPreparednessFromValue,
  getValueFromPreparedness,
} from "../utils/slider-conversions";

const COMMON_INPUT_CLASSES =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:focus:border-blue-400 dark:focus:ring-blue-400";
const COMMON_BUTTON_CLASSES =
  "w-full rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-400 cursor-pointer";
const DELETE_BUTTON_CLASSES =
  "w-full mt-4 rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-400 cursor-pointer";

export const ControlPanel = memo(function ControlPanel() {
  const selectedPointId = useDiagramStore((state) => state.selectedPoint);
  const selectedPointData = useDiagramStore((state) =>
    state.selectedPoint
      ? state.points.find((p) => p.id === state.selectedPoint)
      : undefined,
  );
  const addPoint = useDiagramStore((state) => state.addPoint);
  const updatePoint = useDiagramStore((state) => state.updatePoint);
  const removePoint = useDiagramStore((state) => state.removePoint);
  const selectPoint = useDiagramStore((state) => state.selectPoint);
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
    if (selectedPointData) {
      if (
        !editingPoint ||
        editingPoint.id !== selectedPointData.id ||
        (!isUserEditing &&
          (editingPoint.category !== selectedPointData.category ||
            editingPoint.likelihood !== selectedPointData.likelihood))
      ) {
        // Update editingPoint when point data changes (e.g., after drag operations)
        // but don't reset user's active edits
        setEditingPoint({ ...selectedPointData });
        setIsUserEditing(false);
      }
      // Don't auto-collapse when a point is selected - let user control panel state
    } else if (editingPoint) {
      setEditingPoint(undefined);
      setIsUserEditing(false);
    }
  }, [selectedPointData, editingPoint, isUserEditing]);

  const handleAddPoint = useCallback(
    (event: React.FormEvent) => {
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
    },
    [addPoint, newPoint],
  );

  const handleUpdatePoint = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (selectedPointId && editingPoint && selectedPointData) {
        const originalPoint = selectedPointData;

        // Check if category or likelihood changed
        const categoryChanged =
          editingPoint.category !== originalPoint.category;
        const likelihoodChanged =
          editingPoint.likelihood !== originalPoint.likelihood;

        // Only include fields that have actually changed
        const updates: Partial<Point> = {};
        if (editingPoint.label !== originalPoint.label)
          updates.label = editingPoint.label;

        // Treat empty string and undefined as equivalent for description;
        // always normalise to undefined when the field is blank.
        const normalisedDescription =
          editingPoint.description || undefined;
        const normalisedOriginalDescription =
          originalPoint.description || undefined;
        if (normalisedDescription !== normalisedOriginalDescription)
          updates.description = normalisedDescription;

        if (categoryChanged) updates.category = editingPoint.category;
        if (likelihoodChanged) updates.likelihood = editingPoint.likelihood;
        if (editingPoint.relevance !== originalPoint.relevance)
          updates.relevance = editingPoint.relevance;
        if (editingPoint.preparedness !== originalPoint.preparedness)
          updates.preparedness = editingPoint.preparedness;

        // Skip the store update entirely if nothing changed, preventing
        // an unnecessary re-render of every component subscribed to points.
        if (Object.keys(updates).length === 0) {
          setIsUserEditing(false);
          return;
        }

        // Preserve position if only non-spatial properties changed
        const preservePosition = !categoryChanged && !likelihoodChanged;

        updatePoint(selectedPointId, updates, preservePosition);
        setIsUserEditing(false);
      }
    },
    [selectedPointId, editingPoint, selectedPointData, updatePoint],
  );

  const handleLabelChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
      if (isEditing && editingPoint) {
        setEditingPoint({ ...editingPoint, label: event.target.value });
        setIsUserEditing(true);
      } else {
        setNewPoint((previous) => ({
          ...previous,
          label: event.target.value,
        }));
      }
    },
    [editingPoint],
  );

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>, isEditing: boolean) => {
      if (isEditing && editingPoint) {
        setEditingPoint({ ...editingPoint, description: event.target.value });
        setIsUserEditing(true);
      } else {
        setNewPoint((previous) => ({
          ...previous,
          description: event.target.value,
        }));
      }
    },
    [editingPoint],
  );

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((previous) => !previous);
  }, []);

  const handleCloseEdit = useCallback(() => {
    selectPoint();
    setEditingPoint(undefined);
    setIsUserEditing(false);
    // Keep the panel expanded when closing edit - user can manually collapse if needed
  }, [selectPoint]);

  const handleDeletePoint = useCallback(() => {
    if (selectedPointId) {
      removePoint(selectedPointId);
      // Keep the panel expanded when deleting point - user can manually collapse if needed
      selectPoint();
      setEditingPoint(undefined);
      setIsUserEditing(false);
    }
  }, [selectedPointId, removePoint, selectPoint]);

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
          className={COMMON_INPUT_CLASSES}
          required
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
          htmlFor={isEditing ? "edit-point-description" : "point-description"}
        >
          Description
        </label>
        <textarea
          id={isEditing ? "edit-point-description" : "point-description"}
          name="description"
          value={point.description ?? ""}
          onChange={(event) => handleDescriptionChange(event, isEditing)}
          rows={3}
          placeholder="Optional notes or rationale…"
          className={`${COMMON_INPUT_CLASSES} resize-y`}
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
          className={COMMON_INPUT_CLASSES}
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

      <button type="submit" className={COMMON_BUTTON_CLASSES}>
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
            <button onClick={handleDeletePoint} className={DELETE_BUTTON_CLASSES}>
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
});
