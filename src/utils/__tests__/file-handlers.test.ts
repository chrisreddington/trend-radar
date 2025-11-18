import {
  DiagramState,
  Category,
  Likelihood,
  Relevance,
  Preparedness,
} from "../../types";
import {
  generateFilename,
  exportDiagram,
  validateDiagramData,
  saveDiagramToFile,
  loadDiagramFromFile,
  CURRENT_VERSION,
} from "../file-handlers";
import { vi } from "vitest";

// Mock window.showSaveFilePicker and window.showOpenFilePicker
const mockWritable = {
  write: vi.fn(),
  close: vi.fn(),
};

const mockFileHandle = {
  createWritable: vi.fn().mockResolvedValue(mockWritable),
  getFile: vi.fn(),
};

globalThis.window.showSaveFilePicker = vi.fn();
globalThis.window.showOpenFilePicker = vi.fn();

describe("File Handlers", () => {
  const mockState: DiagramState = {
    points: [
      {
        id: "1",
        label: "Test Point",
        category: Category.Technological,
        likelihood: Likelihood.Average,
        relevance: Relevance.Moderate,
        preparedness: Preparedness.ModeratelyPrepared,
        x: 0,
        y: 0,
      },
    ],
  };

  beforeEach(() => {
    // Mock Date to ensure consistent timestamps
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-04-12"));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("generateFilename", () => {
    it("should generate filename with current date", () => {
      expect(generateFilename()).toBe("trend-radar-2025-04-12.json");
    });
  });

  describe("exportDiagram", () => {
    it("should add version and metadata to exported diagram", () => {
      const exported = exportDiagram(mockState);

      expect(exported).toEqual({
        version: CURRENT_VERSION,
        points: mockState.points,
        metadata: {
          createdAt: expect.any(String),
          lastModifiedAt: expect.any(String),
        },
      });
    });

    it("should use ISO date format for timestamps", () => {
      const exported = exportDiagram(mockState);
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

      expect(exported.metadata.createdAt).toMatch(isoDateRegex);
      expect(exported.metadata.lastModifiedAt).toMatch(isoDateRegex);
    });
  });

  describe("validateDiagramData", () => {
    it("should validate correct diagram data", () => {
      const validData = exportDiagram(mockState);
      expect(validateDiagramData(validData)).toBe(true);
    });

    it("should reject data without version", () => {
      const invalidData = {
        ...exportDiagram(mockState),
        version: undefined,
      };
      expect(validateDiagramData(invalidData)).toBe(false);
    });

    it("should reject data without points array", () => {
      const invalidData = {
        ...exportDiagram(mockState),
        points: undefined,
      };
      expect(validateDiagramData(invalidData)).toBe(false);
    });

    it("should reject data with invalid point structure", () => {
      const invalidData = {
        ...exportDiagram(mockState),
        points: [{ id: "1" }], // Missing required properties
      };
      expect(validateDiagramData(invalidData)).toBe(false);
    });

    it("should reject data without metadata", () => {
      const invalidData = {
        ...exportDiagram(mockState),
        metadata: undefined,
      };
      expect(validateDiagramData(invalidData)).toBe(false);
    });

    it("should reject data with invalid metadata structure", () => {
      const invalidData = {
        ...exportDiagram(mockState),
        metadata: { createdAt: 123 }, // Wrong type and missing lastModifiedAt
      };
      expect(validateDiagramData(invalidData)).toBe(false);
    });

    it("should reject non-object data", () => {
      expect(validateDiagramData(void 0)).toBe(false);
      expect(validateDiagramData("string")).toBe(false);
      expect(validateDiagramData(123)).toBe(false);
    });
  });

  describe("saveDiagramToFile", () => {
    it("should save diagram to file", async () => {
      (
        globalThis.showSaveFilePicker as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockFileHandle);

      await saveDiagramToFile(mockState);

      expect(globalThis.showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: "trend-radar-2025-04-12.json",
        types: [
          {
            description: "JSON Files",
            accept: {
              "application/json": [".json"],
            },
          },
        ],
      });

      expect(mockFileHandle.createWritable).toHaveBeenCalled();
      expect(mockWritable.write).toHaveBeenCalledWith(expect.any(Blob));
      expect(mockWritable.close).toHaveBeenCalled();
    });

    it("should handle user cancellation", async () => {
      const abortError = new Error("User cancelled");
      abortError.name = "AbortError";
      (
        globalThis.showSaveFilePicker as ReturnType<typeof vi.fn>
      ).mockRejectedValue(abortError);

      await expect(saveDiagramToFile(mockState)).resolves.toBeUndefined();
      expect(mockFileHandle.createWritable).not.toHaveBeenCalled();
    });

    it("should throw other errors", async () => {
      const error = new Error("Failed to save");
      (
        globalThis.showSaveFilePicker as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      await expect(saveDiagramToFile(mockState)).rejects.toThrow(
        "Failed to save diagram",
      );
    });
  });

  describe("loadDiagramFromFile", () => {
    const mockFileContent = {
      version: CURRENT_VERSION,
      points: mockState.points,
      metadata: {
        createdAt: "2025-04-12T00:00:00.000Z",
        lastModifiedAt: "2025-04-12T00:00:00.000Z",
      },
    };

    beforeEach(() => {
      mockFileHandle.getFile.mockResolvedValue({
        text: vi.fn().mockResolvedValue(JSON.stringify(mockFileContent)),
      });
    });

    it("should load diagram from file", async () => {
      (
        globalThis.showOpenFilePicker as ReturnType<typeof vi.fn>
      ).mockResolvedValue([mockFileHandle]);

      const result = await loadDiagramFromFile();

      expect(globalThis.showOpenFilePicker).toHaveBeenCalledWith({
        types: [
          {
            description: "JSON Files",
            accept: {
              "application/json": [".json"],
            },
          },
        ],
      });

      expect(mockFileHandle.getFile).toHaveBeenCalled();
      expect(result).toEqual(mockFileContent);
    });

    it("should handle user cancellation", async () => {
      const abortError = new Error("User cancelled");
      abortError.name = "AbortError";
      (
        globalThis.showOpenFilePicker as ReturnType<typeof vi.fn>
      ).mockRejectedValue(abortError);

      await expect(loadDiagramFromFile()).rejects.toEqual(abortError);
    });

    it("should handle invalid file contents", async () => {
      mockFileHandle.getFile.mockResolvedValue({
        text: vi.fn().mockResolvedValue("invalid json"),
      });
      (
        globalThis.showOpenFilePicker as ReturnType<typeof vi.fn>
      ).mockResolvedValue([mockFileHandle]);

      await expect(loadDiagramFromFile()).rejects.toThrow();
    });

    it("should handle invalid diagram data", async () => {
      mockFileHandle.getFile.mockResolvedValue({
        text: vi.fn().mockResolvedValue(JSON.stringify({ invalid: "data" })),
      });
      (
        globalThis.showOpenFilePicker as ReturnType<typeof vi.fn>
      ).mockResolvedValue([mockFileHandle]);

      await expect(loadDiagramFromFile()).rejects.toThrow(
        "Invalid diagram file format",
      );
    });

    it("should throw other errors", async () => {
      const error = new Error("Failed to load");
      (
        globalThis.showOpenFilePicker as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      await expect(loadDiagramFromFile()).rejects.toThrow(
        "Failed to load diagram",
      );
    });
  });
});
