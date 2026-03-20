import { renderHook } from "@testing-library/react";
import { useDiagramPersistence } from "../use-diagram-persistence";
import { useDiagramStore } from "../../store/use-diagram-store";
import { vi } from "vitest";

vi.mock("../../store/use-diagram-store", () => {
  const subscribe = vi.fn(() => vi.fn());

  const mockStore = {
    subscribe,
    getState: vi.fn(() => ({
      loadState: vi.fn(),
      saveState: vi.fn(),
      points: [],
    })),
  };

  return {
    useDiagramStore: Object.assign(vi.fn(), mockStore),
  };
});

describe("useDiagramPersistence", () => {
  let mockLoadState: ReturnType<typeof vi.fn>;
  let mockSaveState: ReturnType<typeof vi.fn>;
  let mockPoints: unknown[];
  let mockSubscribe: ReturnType<typeof vi.fn>;
  let capturedListener: ((state: { points: unknown[]; saveState: () => void }) => void) | undefined;

  beforeEach(() => {
    mockLoadState = vi.fn();
    mockSaveState = vi.fn();
    mockPoints = [];
    capturedListener = undefined;

    mockSubscribe = vi.fn((listener) => {
      capturedListener = listener;
      return vi.fn();
    });

    (useDiagramStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({
      loadState: mockLoadState,
      saveState: mockSaveState,
      points: mockPoints,
    });

    (useDiagramStore.subscribe as ReturnType<typeof vi.fn>).mockImplementation(
      mockSubscribe,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("on mount", () => {
    it("should call loadState once to restore persisted diagram", () => {
      renderHook(() => useDiagramPersistence());
      expect(mockLoadState).toHaveBeenCalledTimes(1);
    });

    it("should subscribe to the store to watch for point changes", () => {
      renderHook(() => useDiagramPersistence());
      expect(mockSubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe("auto-save behaviour", () => {
    it("should call saveState when points reference changes", () => {
      renderHook(() => useDiagramPersistence());

      const newPoints = [{ id: "1" }];
      capturedListener?.({ points: newPoints, saveState: mockSaveState });

      expect(mockSaveState).toHaveBeenCalledTimes(1);
    });

    it("should not call saveState when points reference is unchanged", () => {
      renderHook(() => useDiagramPersistence());

      capturedListener?.({ points: mockPoints, saveState: mockSaveState });

      expect(mockSaveState).not.toHaveBeenCalled();
    });

    it("should track updated points reference to avoid duplicate saves", () => {
      renderHook(() => useDiagramPersistence());

      const firstPoints = [{ id: "1" }];
      capturedListener?.({ points: firstPoints, saveState: mockSaveState });
      expect(mockSaveState).toHaveBeenCalledTimes(1);

      // Firing again with the same reference should not trigger another save
      capturedListener?.({ points: firstPoints, saveState: mockSaveState });
      expect(mockSaveState).toHaveBeenCalledTimes(1);

      // A new reference should trigger a save
      const secondPoints = [{ id: "1" }, { id: "2" }];
      capturedListener?.({ points: secondPoints, saveState: mockSaveState });
      expect(mockSaveState).toHaveBeenCalledTimes(2);
    });
  });

  describe("cleanup", () => {
    it("should unsubscribe from the store on unmount", () => {
      const mockUnsubscribe = vi.fn();
      (
        useDiagramStore.subscribe as ReturnType<typeof vi.fn>
      ).mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() => useDiagramPersistence());
      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
