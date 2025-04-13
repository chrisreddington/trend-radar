import { DiagramState } from "../types";

// Add type declarations for the File System Access API
declare global {
  interface Window {
    showSaveFilePicker: (
      options?: SaveFilePickerOptions,
    ) => Promise<FileSystemFileHandle>;
    showOpenFilePicker: (
      options?: OpenFilePickerOptions,
    ) => Promise<FileSystemFileHandle[]>;
  }

  const showSaveFilePicker: Window["showSaveFilePicker"];
  const showOpenFilePicker: Window["showOpenFilePicker"];
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: FilePickerAcceptType[];
}

interface OpenFilePickerOptions {
  types?: FilePickerAcceptType[];
}

interface FilePickerAcceptType {
  description: string;
  accept: Record<string, string[]>;
}

export interface DiagramExport extends DiagramState {
  version: number;
  metadata: {
    createdAt: string;
    lastModifiedAt: string;
  };
}

export const CURRENT_VERSION = 1;

function isFileSystemAccessSupported(): boolean {
  return (
    typeof globalThis !== "undefined" && "showSaveFilePicker" in globalThis
  );
}

export function generateFilename(): string {
  const date = new Date().toISOString().split("T")[0];
  return `trend-radar-${date}.json`;
}

export function exportDiagram(state: DiagramState): DiagramExport {
  const now = new Date().toISOString();
  return {
    version: CURRENT_VERSION,
    points: state.points,
    metadata: {
      createdAt: now,
      lastModifiedAt: now,
    },
  };
}

export async function saveDiagramToFile(state: DiagramState): Promise<void> {
  if (!isFileSystemAccessSupported()) {
    // Fallback for browsers that don't support File System Access API
    const exportData = exportDiagram(state);
    const blob = new Blob([JSON.stringify(exportData, undefined, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = generateFilename();
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return;
  }

  try {
    const handle = await showSaveFilePicker({
      suggestedName: generateFilename(),
      types: [
        {
          description: "JSON Files",
          accept: {
            "application/json": [".json"],
          },
        },
      ],
    });

    const exportData = exportDiagram(state);
    const blob = new Blob([JSON.stringify(exportData, undefined, 2)], {
      type: "application/json",
    });

    const writableStream = await handle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();
  } catch (error) {
    if ((error as Error).name !== "AbortError") {
      throw new Error("Failed to save diagram: " + (error as Error).message);
    }
  }
}

export function validateDiagramData(data: unknown): data is DiagramExport {
  if (!data || typeof data !== "object") return false;

  const exportData = data as Partial<DiagramExport>;
  if (typeof exportData.version !== "number") return false;
  if (!Array.isArray(exportData.points)) return false;
  if (!exportData.metadata || typeof exportData.metadata !== "object")
    return false;

  const { metadata } = exportData;
  if (
    typeof metadata.createdAt !== "string" ||
    typeof metadata.lastModifiedAt !== "string"
  ) {
    return false;
  }

  // Validate each point has required properties
  return exportData.points.every(
    (point) =>
      typeof point === "object" &&
      point !== null &&
      typeof point.id === "string" &&
      typeof point.label === "string" &&
      typeof point.category === "string" &&
      typeof point.likelihood === "string" &&
      typeof point.relevance === "string" &&
      typeof point.preparedness === "string" &&
      typeof point.x === "number" &&
      typeof point.y === "number",
  );
}

export async function loadDiagramFromFile(): Promise<DiagramExport> {
  if (!isFileSystemAccessSupported()) {
    // Create a hidden file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";
    document.body.append(input);

    // Wrap the file selection in a promise
    const fileData = await new Promise<DiagramExport>((resolve, reject) => {
      const handleFileSelect = async () => {
        try {
          const file = input.files?.[0];
          if (!file) {
            input.remove();
            reject(new Error("File selection cancelled"));
            return;
          }

          const content = await file.text();
          const data = JSON.parse(content);

          if (!validateDiagramData(data)) {
            reject(new Error("Invalid diagram file format"));
            return;
          }

          resolve(data);
        } catch (error) {
          reject(
            new Error("Failed to load diagram: " + (error as Error).message),
          );
        } finally {
          input.remove();
        }
      };

      const handleCancel = () => {
        input.remove();
        const error = new Error("File selection cancelled");
        error.name = "AbortError";
        reject(error);
      };

      input.addEventListener("change", handleFileSelect);
      input.addEventListener("cancel", handleCancel);

      // Trigger file selection dialog
      input.click();
    });

    return fileData;
  }

  try {
    const [handle] = await showOpenFilePicker({
      types: [
        {
          description: "JSON Files",
          accept: {
            "application/json": [".json"],
          },
        },
      ],
    });

    const file = await handle.getFile();
    const content = await file.text();
    const data = JSON.parse(content);

    if (!validateDiagramData(data)) {
      throw new Error("Invalid diagram file format");
    }

    return data;
  } catch (error) {
    // Propagate AbortError as is, wrap other errors
    if ((error as Error).name === "AbortError") {
      throw error;
    }
    throw new Error("Failed to load diagram: " + (error as Error).message);
  }
}
