"use client";
import { useState } from "react";
import { useDiagramStore } from "../store/use-diagram-store";

export const FileOperations = () => {
  const { saveDiagram, loadDiagram } = useDiagramStore();
  const [error, setError] = useState<string | undefined>();

  const commonButtonClasses =
    "px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2";

  const handleSave = async () => {
    try {
      setError(undefined);
      await saveDiagram();
    } catch (error) {
      setError("Failed to save diagram");
      console.error(error);
    }
  };

  const handleLoad = async () => {
    try {
      setError(undefined);
      await loadDiagram();
    } catch (error) {
      setError("Failed to load diagram");
      console.error(error);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-center items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            className={`${commonButtonClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800`}
          >
            Save Diagram
          </button>
          <button
            type="button"
            onClick={handleLoad}
            className={`${commonButtonClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800`}
          >
            Load Diagram
          </button>
        </div>

        {error && (
          <div
            className="p-3 text-sm text-red-600 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
