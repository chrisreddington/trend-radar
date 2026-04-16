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

    it("should accept points with a valid string description", () => {
      const stateWithDescription: DiagramState = {
        points: [
          {
            ...mockState.points[0],
            description: "Some context",
          },
        ],
      };
      const validData = exportDiagram(stateWithDescription);
      expect(validateDiagramData(validData)).toBe(true);
    });

    it("should accept points without a description", () => {
      const validData = exportDiagram(mockState);
      expect(validateDiagramData(validData)).toBe(true);
    });

    it("should reject points with a non-string description", () => {
      const invalidData = {
        ...exportDiagram(mockState),
        points: [{ ...mockState.points[0], description: 123 }],
      };
      expect(validateDiagramData(invalidData)).toBe(false);
    });

    it("should reject points with an invalid category value", () => {
      const invalidData = {
        ...exportDiagram(mockState),
        points: [{ ...mockState.points[0], category: "InvalidCategory" }],
      };
      expect(validateDiagramData(invalidData)).toBe(false);
    });

    it("should reject points with an invalid likelihood value", () => {
      const invalidData = {
        ...exportDiagram(mockState),
        points: [{ ...mockState.points[0], likelihood: "Very Likely" }],
      };
      expect(validateDiagramData(invalidData)).toBe(false);
    });

    it("should reject points with an invalid relevance value", () => {
      const invalidData = {
        ...exportDiagram(mockState),
        points: [{ ...mockState.points[0], relevance: "Critical" }],
      };
      expect(validateDiagramData(invalidData)).toBe(false);
    });

    it("should reject points with an invalid preparedness value", () => {
      const invalidData = {
        ...exportDiagram(mockState),
        points: [{ ...mockState.points[0], preparedness: "Not Prepared" }],
      };
      expect(validateDiagramData(invalidData)).toBe(false);
    });

    it("should accept points with all valid enum values", () => {
      const validData = exportDiagram({
        points: [
          {
            ...mockState.points[0],
            category: Category.Economic,
            likelihood: Likelihood.Likely,
            relevance: Relevance.Low,
            preparedness: Preparedness.InadequatelyPrepared,
          },
        ],
      });
      expect(validateDiagramData(validData)).toBe(true);
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

describe("File Handlers - fallback (no File System Access API)", () => {
  const mockState: DiagramState = {
    points: [
      {
        id: "1",
        label: "Fallback Test Point",
        category: Category.Technological,
        likelihood: Likelihood.Average,
        relevance: Relevance.Moderate,
        preparedness: Preparedness.ModeratelyPrepared,
        x: 0,
        y: 0,
      },
    ],
  };

  let savedShowSaveFilePicker: typeof globalThis.showSaveFilePicker | undefined;
  let savedShowOpenFilePicker: typeof globalThis.showOpenFilePicker | undefined;
  let hadShowSaveFilePicker: boolean;
  let hadShowOpenFilePicker: boolean;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-04-12"));
    vi.clearAllMocks();

    // Remove FSA API so the fallback code path is exercised
    hadShowSaveFilePicker = "showSaveFilePicker" in globalThis;
    hadShowOpenFilePicker = "showOpenFilePicker" in globalThis;
    savedShowSaveFilePicker = globalThis.showSaveFilePicker;
    savedShowOpenFilePicker = globalThis.showOpenFilePicker;
    delete (globalThis as Record<string, unknown>).showSaveFilePicker;
    delete (globalThis as Record<string, unknown>).showOpenFilePicker;
  });

  afterEach(() => {
    vi.useRealTimers();
    // Restore FSA API stubs only if they existed before deletion
    if (hadShowSaveFilePicker) {
      (globalThis as Record<string, unknown>).showSaveFilePicker =
        savedShowSaveFilePicker;
    } else {
      delete (globalThis as Record<string, unknown>).showSaveFilePicker;
    }
    if (hadShowOpenFilePicker) {
      (globalThis as Record<string, unknown>).showOpenFilePicker =
        savedShowOpenFilePicker;
    } else {
      delete (globalThis as Record<string, unknown>).showOpenFilePicker;
    }
  });

  describe("saveDiagramToFile fallback", () => {
    it("should create a downloadable anchor element and trigger click", async () => {
      const mockAnchor = {
        href: "",
        download: "",
        click: vi.fn(),
        remove: vi.fn(),
      };
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tag: string) => {
          if (tag === "a") return mockAnchor as unknown as HTMLAnchorElement;
          return originalCreateElement(tag);
        });
      vi.spyOn(document.body, "append").mockImplementation(vi.fn());
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:fake-url");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(vi.fn());

      await saveDiagramToFile(mockState);

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(mockAnchor.href).toBe("blob:fake-url");
      expect(mockAnchor.download).toBe("trend-radar-2025-04-12.json");
      expect(document.body.append).toHaveBeenCalledWith(mockAnchor);
      expect(mockAnchor.click).toHaveBeenCalledTimes(1);
      expect(mockAnchor.remove).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
    });
  });

  describe("loadDiagramFromFile fallback", () => {
    const mockFileContent = {
      version: CURRENT_VERSION,
      points: mockState.points,
      metadata: {
        createdAt: "2025-04-12T00:00:00.000Z",
        lastModifiedAt: "2025-04-12T00:00:00.000Z",
      },
    };

    it("should create a file input element, trigger click, and resolve with file data", async () => {
      const changeListeners: Array<() => void> = [];
      const cancelListeners: Array<() => void> = [];
      const mockFile = new Blob([JSON.stringify(mockFileContent)], {
        type: "application/json",
      });
      const fileWithText = Object.assign(mockFile, {
        text: () => Promise.resolve(JSON.stringify(mockFileContent)),
      });
      const mockInput = {
        type: "",
        accept: "",
        style: { display: "" },
        files: [fileWithText],
        click: vi.fn(),
        remove: vi.fn(),
        addEventListener: vi.fn(
          (event: string, handler: EventListenerOrEventListenerObject) => {
            if (event === "change")
              changeListeners.push(handler as () => void);
            if (event === "cancel")
              cancelListeners.push(handler as () => void);
          },
        ),
      };
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "input")
          return mockInput as unknown as HTMLInputElement;
        return originalCreateElement(tag);
      });
      vi.spyOn(document.body, "append").mockImplementation(vi.fn());
      mockInput.click.mockImplementation(() => {
        // Simulate file selection after listeners are registered
        changeListeners[0]?.();
      });

      const result = await loadDiagramFromFile();

      expect(mockInput.type).toBe("file");
      expect(mockInput.accept).toBe(".json");
      expect(result).toEqual(mockFileContent);
    });

    it("should reject with AbortError when user cancels file selection", async () => {
      const cancelListeners: Array<() => void> = [];
      const mockInput = {
        type: "",
        accept: "",
        style: { display: "" },
        files: undefined,
        click: vi.fn(),
        remove: vi.fn(),
        addEventListener: vi.fn(
          (event: string, handler: EventListenerOrEventListenerObject) => {
            if (event === "cancel")
              cancelListeners.push(handler as () => void);
          },
        ),
      };
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "input")
          return mockInput as unknown as HTMLInputElement;
        return originalCreateElement(tag);
      });
      vi.spyOn(document.body, "append").mockImplementation(vi.fn());
      mockInput.click.mockImplementation(() => {
        // Simulate user cancel after listeners are registered
        cancelListeners[0]?.();
      });

      await expect(loadDiagramFromFile()).rejects.toMatchObject({
        name: "AbortError",
      });
    });

    it("should reject when selected file contains invalid diagram data", async () => {
      const changeListeners: Array<() => void> = [];
      const mockFile = new Blob([JSON.stringify({ invalid: "data" })], {
        type: "application/json",
      });
      const fileWithText = Object.assign(mockFile, {
        text: () => Promise.resolve(JSON.stringify({ invalid: "data" })),
      });
      const mockInput = {
        type: "",
        accept: "",
        style: { display: "" },
        files: [fileWithText],
        click: vi.fn(),
        remove: vi.fn(),
        addEventListener: vi.fn(
          (event: string, handler: EventListenerOrEventListenerObject) => {
            if (event === "change")
              changeListeners.push(handler as () => void);
          },
        ),
      };
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "input")
          return mockInput as unknown as HTMLInputElement;
        return originalCreateElement(tag);
      });
      vi.spyOn(document.body, "append").mockImplementation(vi.fn());
      mockInput.click.mockImplementation(() => {
        // Simulate file selection after listeners are registered
        changeListeners[0]?.();
      });

      await expect(loadDiagramFromFile()).rejects.toThrow(
        "Invalid diagram file format",
      );
    });

    it("should reject when no file is selected (empty files list)", async () => {
      const changeListeners: Array<() => void> = [];
      const mockInput = {
        type: "",
        accept: "",
        style: { display: "" },
        files: undefined,
        click: vi.fn(),
        remove: vi.fn(),
        addEventListener: vi.fn(
          (event: string, handler: EventListenerOrEventListenerObject) => {
            if (event === "change")
              changeListeners.push(handler as () => void);
          },
        ),
      };
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "input")
          return mockInput as unknown as HTMLInputElement;
        return originalCreateElement(tag);
      });
      vi.spyOn(document.body, "append").mockImplementation(vi.fn());
      mockInput.click.mockImplementation(() => {
        // Simulate file selection after listeners are registered
        changeListeners[0]?.();
      });

      await expect(loadDiagramFromFile()).rejects.toThrow(
        "File selection cancelled",
      );
    });
  });
});
