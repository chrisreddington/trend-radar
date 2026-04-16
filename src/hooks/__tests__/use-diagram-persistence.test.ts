import { renderHook } from "@testing-library/react";
import {
  SAVE_DEBOUNCE_MS,
  useDiagramPersistence,
} from "../use-diagram-persistence";
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
  let currentPoints: unknown[];
  let mockSubscribe: ReturnType<typeof vi.fn>;
  let capturedListener:
    | ((state: { points: unknown[]; saveState: () => void }) => void)
    | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    mockLoadState = vi.fn();
    mockSaveState = vi.fn();
    mockPoints = [];
    currentPoints = mockPoints;
    capturedListener = undefined;

    mockSubscribe = vi.fn((listener) => {
      capturedListener = listener;
      return vi.fn();
    });

    (useDiagramStore.getState as ReturnType<typeof vi.fn>).mockImplementation(
      () => ({
        loadState: mockLoadState,
        saveState: mockSaveState,
        points: currentPoints,
      }),
    );

    (useDiagramStore.subscribe as ReturnType<typeof vi.fn>).mockImplementation(
      mockSubscribe,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("on mount", () => {
    it("loads persisted state once", () => {
      renderHook(() => useDiagramPersistence());
      expect(mockLoadState).toHaveBeenCalledTimes(1);
    });

    it("subscribes to the store", () => {
      renderHook(() => useDiagramPersistence());
      expect(mockSubscribe).toHaveBeenCalledTimes(1);
    });

    it("continues subscribing when loadState throws", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(vi.fn());
      mockLoadState.mockImplementation(() => {
        throw new Error("Corrupted localStorage data");
      });

      expect(() => renderHook(() => useDiagramPersistence())).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to load persisted diagram state:",
        expect.any(Error),
      );
      expect(mockSubscribe).toHaveBeenCalledTimes(1);
    });

    it("initializes previous points from the hydrated store state", () => {
      currentPoints = [];
      mockLoadState.mockImplementation(() => {
        currentPoints = [{ id: "hydrated" }];
      });

      renderHook(() => useDiagramPersistence());
      capturedListener?.({ points: currentPoints, saveState: mockSaveState });
      vi.advanceTimersByTime(SAVE_DEBOUNCE_MS);

      expect(mockSaveState).not.toHaveBeenCalled();
    });
  });

  describe("auto-save behaviour", () => {
    it("saves only after the debounce delay elapses", () => {
      renderHook(() => useDiagramPersistence());

      const newPoints = [{ id: "1" }];
      capturedListener?.({ points: newPoints, saveState: mockSaveState });

      vi.advanceTimersByTime(SAVE_DEBOUNCE_MS - 1);
      expect(mockSaveState).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockSaveState).toHaveBeenCalledTimes(1);
    });

    it("does not save when the points reference is unchanged", () => {
      renderHook(() => useDiagramPersistence());

      capturedListener?.({ points: mockPoints, saveState: mockSaveState });
      vi.advanceTimersByTime(SAVE_DEBOUNCE_MS);

      expect(mockSaveState).not.toHaveBeenCalled();
    });

    it("coalesces rapid updates into a single save", () => {
      renderHook(() => useDiagramPersistence());

      capturedListener?.({ points: [{ id: "1" }], saveState: mockSaveState });
      vi.advanceTimersByTime(SAVE_DEBOUNCE_MS - 1);
      capturedListener?.({ points: [{ id: "1" }, { id: "2" }], saveState: mockSaveState });
      vi.advanceTimersByTime(SAVE_DEBOUNCE_MS - 1);
      capturedListener?.({ points: [{ id: "1" }, { id: "2" }, { id: "3" }], saveState: mockSaveState });

      vi.advanceTimersByTime(SAVE_DEBOUNCE_MS - 1);
      expect(mockSaveState).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockSaveState).toHaveBeenCalledTimes(1);
    });

    it("ignores repeated notifications for the same points reference", () => {
      renderHook(() => useDiagramPersistence());

      const firstPoints = [{ id: "1" }];
      capturedListener?.({ points: firstPoints, saveState: mockSaveState });
      vi.advanceTimersByTime(SAVE_DEBOUNCE_MS);
      expect(mockSaveState).toHaveBeenCalledTimes(1);

      capturedListener?.({ points: firstPoints, saveState: mockSaveState });
      vi.advanceTimersByTime(SAVE_DEBOUNCE_MS);
      expect(mockSaveState).toHaveBeenCalledTimes(1);

      const secondPoints = [{ id: "1" }, { id: "2" }];
      capturedListener?.({ points: secondPoints, saveState: mockSaveState });
      vi.advanceTimersByTime(SAVE_DEBOUNCE_MS);
      expect(mockSaveState).toHaveBeenCalledTimes(2);
    });

    it("swallows saveState errors raised by the debounced callback", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(vi.fn());
      mockSaveState.mockImplementation(() => {
        throw new Error("Quota exceeded");
      });

      renderHook(() => useDiagramPersistence());
      capturedListener?.({ points: [{ id: "1" }], saveState: mockSaveState });

      expect(() => vi.advanceTimersByTime(SAVE_DEBOUNCE_MS)).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to persist diagram state:",
        expect.any(Error),
      );
    });
  });

  describe("cleanup", () => {
    it("unsubscribes from the store on unmount", () => {
      const mockUnsubscribe = vi.fn();
      (
        useDiagramStore.subscribe as ReturnType<typeof vi.fn>
      ).mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() => useDiagramPersistence());
      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it("cancels any pending debounced save on unmount", () => {
      const { unmount } = renderHook(() => useDiagramPersistence());

      capturedListener?.({ points: [{ id: "1" }], saveState: mockSaveState });
      unmount();
      vi.advanceTimersByTime(SAVE_DEBOUNCE_MS);

      expect(mockSaveState).not.toHaveBeenCalled();
    });
  });
});
