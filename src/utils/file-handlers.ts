import { DiagramState } from "../types";

export interface DiagramExport extends DiagramState {
  version: number;
  metadata: {
    createdAt: string;
    lastModifiedAt: string;
  };
}

export const CURRENT_VERSION = 1;

export function generateFilename(): string {
  const date = new Date().toISOString().split('T')[0];
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
    }
  };
}

export async function saveDiagramToFile(state: DiagramState): Promise<void> {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: generateFilename(),
      types: [{
        description: 'JSON Files',
        accept: {
          'application/json': ['.json'],
        },
      }],
    });

    const exportData = exportDiagram(state);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const writableStream = await handle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      throw new Error('Failed to save diagram: ' + (error as Error).message);
    }
  }
}

export function validateDiagramData(data: unknown): data is DiagramExport {
  if (!data || typeof data !== 'object') return false;
  
  const exportData = data as Partial<DiagramExport>;
  if (typeof exportData.version !== 'number') return false;
  if (!Array.isArray(exportData.points)) return false;
  if (!exportData.metadata || typeof exportData.metadata !== 'object') return false;
  
  const { metadata } = exportData;
  if (typeof metadata.createdAt !== 'string' || typeof metadata.lastModifiedAt !== 'string') {
    return false;
  }

  // Validate each point has required properties
  return exportData.points.every(point => (
    typeof point === 'object' &&
    point !== null &&
    typeof point.id === 'string' &&
    typeof point.label === 'string' &&
    typeof point.category === 'string' &&
    typeof point.likelihood === 'string' &&
    typeof point.relevance === 'string' &&
    typeof point.preparedness === 'string' &&
    typeof point.x === 'number' &&
    typeof point.y === 'number'
  ));
}

export async function loadDiagramFromFile(): Promise<DiagramExport> {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: 'JSON Files',
        accept: {
          'application/json': ['.json'],
        },
      }],
    });

    const file = await handle.getFile();
    const content = await file.text();
    const data = JSON.parse(content);

    if (!validateDiagramData(data)) {
      throw new Error('Invalid diagram file format');
    }

    return data;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      throw new Error('Failed to load diagram: ' + (error as Error).message);
    }
    throw error;
  }
}