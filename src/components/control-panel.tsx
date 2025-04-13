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
      setEditingPoint(point);
    } else {
      setEditingPoint(undefined);
    }
  }, [selectedPoint, points]);

  const handleAddPoint = (event: React.FormEvent) => {
    event.preventDefault();
    addPoint(newPoint);
    setNewPoint({
      ...newPoint,
      label: "",
    });
  };

  const handleUpdatePoint = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedPoint && editingPoint) {
      updatePoint(selectedPoint, editingPoint);
    }
  };

  const handleLabelChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    isEditing: boolean,
  ) => {
    if (isEditing && editingPoint) {
      setEditingPoint({ ...editingPoint, label: event.target.value });
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
  };

  const commonInputClasses =
    "block w-full p-2 text-sm border rounded-lg bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

  const commonButtonClasses =
    "px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2";

  const deleteButtonClasses = `${commonButtonClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800`;

  const renderPointForm = (
    point: Point | Omit<Point, "id">,
    onSubmit: (event: React.FormEvent) => void,
    submitLabel: string,
    isEditing = false,
  ) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Label Input */}
      <div>
        <label
          htmlFor={`${isEditing ? "edit" : "new"}-point-label`}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Label
        </label>
        <input
          type="text"
          id={`${isEditing ? "edit" : "new"}-point-label`}
          value={point.label}
          onChange={(event) => handleLabelChange(event, isEditing)}
          required
          className={commonInputClasses}
          placeholder="Enter point label"
        />
      </div>

      {/* Category Select */}
      <div>
        <label
          htmlFor={`${isEditing ? "edit" : "new"}-point-category`}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Category
        </label>
        <select
          id={`${isEditing ? "edit" : "new"}-point-category`}
          value={point.category}
          onChange={(event) =>
            isEditing && editingPoint
              ? setEditingPoint({
                  ...editingPoint,
                  category: event.target.value as Category,
                })
              : setNewPoint({
                  ...newPoint,
                  category: event.target.value as Category,
                })
          }
          className={commonInputClasses}
        >
          {Object.values(Category).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Likelihood Select */}
      <div>
        <label
          htmlFor={`${isEditing ? "edit" : "new"}-point-likelihood`}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Likelihood
        </label>
        <select
          id={`${isEditing ? "edit" : "new"}-point-likelihood`}
          value={point.likelihood}
          onChange={(event) =>
            isEditing && editingPoint
              ? setEditingPoint({
                  ...editingPoint,
                  likelihood: event.target.value as Likelihood,
                })
              : setNewPoint({
                  ...newPoint,
                  likelihood: event.target.value as Likelihood,
                })
          }
          className={commonInputClasses}
        >
          {Object.values(Likelihood).map((likelihood) => (
            <option key={likelihood} value={likelihood}>
              {likelihood}
            </option>
          ))}
        </select>
      </div>

      {/* Relevance Select */}
      <div>
        <label
          htmlFor={`${isEditing ? "edit" : "new"}-point-relevance`}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Relevance
        </label>
        <select
          id={`${isEditing ? "edit" : "new"}-point-relevance`}
          value={point.relevance}
          onChange={(event) =>
            isEditing && editingPoint
              ? setEditingPoint({
                  ...editingPoint,
                  relevance: event.target.value as Relevance,
                })
              : setNewPoint({
                  ...newPoint,
                  relevance: event.target.value as Relevance,
                })
          }
          className={commonInputClasses}
        >
          {Object.values(Relevance).map((relevance) => (
            <option key={relevance} value={relevance}>
              {relevance}
            </option>
          ))}
        </select>
      </div>

      {/* Preparedness Select */}
      <div>
        <label
          htmlFor={`${isEditing ? "edit" : "new"}-point-preparedness`}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Preparedness
        </label>
        <select
          id={`${isEditing ? "edit" : "new"}-point-preparedness`}
          value={point.preparedness}
          onChange={(event) =>
            isEditing && editingPoint
              ? setEditingPoint({
                  ...editingPoint,
                  preparedness: event.target.value as Preparedness,
                })
              : setNewPoint({
                  ...newPoint,
                  preparedness: event.target.value as Preparedness,
                })
          }
          className={commonInputClasses}
        >
          {Object.values(Preparedness).map((preparedness) => (
            <option key={preparedness} value={preparedness}>
              {preparedness}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button type="submit" className={commonButtonClasses}>
        {submitLabel}
      </button>
    </form>
  );

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          <button
            className="w-full flex justify-between items-center focus:outline-none cursor-pointer"
            onClick={toggleCollapse}
            aria-expanded={!isCollapsed}
            aria-label="Add New Point Toggle"
          >
            Add New Point
            <svg
              className={`w-6 h-6 transform transition-transform duration-200 ${
                isCollapsed ? "-rotate-90" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`p-4 transition-all duration-200 ease-in-out ${
          isCollapsed ? "hidden" : ""
        }`}
      >
        <div>
          {renderPointForm(newPoint, handleAddPoint, "Add Point", false)}
        </div>

        {editingPoint && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Edit Point
              </h3>
              <button
                onClick={handleCloseEdit}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {renderPointForm(
              editingPoint,
              handleUpdatePoint,
              "Update Point",
              true,
            )}
            <button
              onClick={() => selectedPoint && removePoint(selectedPoint)}
              className={deleteButtonClasses}
            >
              Delete Point
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
