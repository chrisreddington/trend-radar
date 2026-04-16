import { renderHook, act } from "@testing-library/react";
import {
  RESIZE_DEBOUNCE_MS,
  useResponsiveSize,
} from "../use-responsive-size";

/**
 * Helper to set the mocked viewport width for tests.
 * @param width - Simulated viewport width in pixels.
 */
function setViewportWidth(width: number) {
  Object.defineProperty(document.documentElement, "clientWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(globalThis, "innerWidth", {
    configurable: true,
    value: width,
  });
}

describe("useResponsiveSize", () => {
  const originalClientWidth = Object.getOwnPropertyDescriptor(
    document.documentElement,
    "clientWidth",
  );
  const originalInnerWidth = Object.getOwnPropertyDescriptor(
    globalThis,
    "innerWidth",
  );

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalClientWidth) {
      Object.defineProperty(
        document.documentElement,
        "clientWidth",
        originalClientWidth,
      );
    }
    if (originalInnerWidth) {
      Object.defineProperty(globalThis, "innerWidth", originalInnerWidth);
    }
  });

  describe("Initial size calculation", () => {
    it("should return 800 as the default size on a desktop viewport", () => {
      setViewportWidth(1200);
      const { result } = renderHook(() => useResponsiveSize());
      // 1200 * 0.75 = 900, capped at 800
      expect(result.current).toBe(800);
    });

    it("should return 75% of viewport width when below 800px cap", () => {
      setViewportWidth(900);
      const { result } = renderHook(() => useResponsiveSize());
      // 900 * 0.75 = 675
      expect(result.current).toBe(675);
    });

    it("should return capped mobile size when viewport is narrow", () => {
      setViewportWidth(400);
      const { result } = renderHook(() => useResponsiveSize());
      // 400 - 40 = 360, below cap of 500
      expect(result.current).toBe(360);
    });

    it("should cap mobile size at 500 when near-full viewport would exceed it", () => {
      setViewportWidth(600);
      const { result } = renderHook(() => useResponsiveSize());
      // mobile: 600 - 40 = 560, capped at 500
      expect(result.current).toBe(500);
    });

    it("should cap mobile size at 500 for a very wide mobile viewport just below breakpoint", () => {
      setViewportWidth(639);
      const { result } = renderHook(() => useResponsiveSize());
      // 639 - 40 = 599, capped at 500
      expect(result.current).toBe(500);
    });
  });

  describe("Resize handling", () => {
    it("should update size after the debounce delay when resized to a desktop width", () => {
      setViewportWidth(300);
      const { result } = renderHook(() => useResponsiveSize());
      const initialSize = result.current;

      act(() => {
        setViewportWidth(1200);
        globalThis.dispatchEvent(new Event("resize"));
        // Size should not update immediately (debounce pending)
      });
      expect(result.current).toBe(initialSize);

      act(() => {
        vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS);
      });

      expect(result.current).not.toBe(initialSize);
      expect(result.current).toBe(800);
    });

    it("should update size after the debounce delay when resized to a narrow mobile width", () => {
      setViewportWidth(1200);
      const { result } = renderHook(() => useResponsiveSize());

      act(() => {
        setViewportWidth(320);
        globalThis.dispatchEvent(new Event("resize"));
      });
      // Still old size until debounce fires
      expect(result.current).toBe(800);

      act(() => {
        vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS);
      });

      // 320 - 40 = 280
      expect(result.current).toBe(280);
    });

    it("should apply only the last resize value when multiple events fire within the debounce window", () => {
      setViewportWidth(1200);
      const { result } = renderHook(() => useResponsiveSize());

      act(() => {
        // Simulate rapid resize events — only the final width should take effect
        setViewportWidth(700);
        globalThis.dispatchEvent(new Event("resize"));
        setViewportWidth(900);
        globalThis.dispatchEvent(new Event("resize"));
        setViewportWidth(1000);
        globalThis.dispatchEvent(new Event("resize"));
      });
      // No update yet
      expect(result.current).toBe(800);

      act(() => {
        vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS);
      });

      // Only the last resize (1000px → 750, capped at 800) should be applied
      expect(result.current).toBe(750);
    });

    it("should remove the resize event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(globalThis, "removeEventListener");
      setViewportWidth(1000);
      const { unmount } = renderHook(() => useResponsiveSize());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "resize",
        expect.any(Function),
      );
      removeEventListenerSpy.mockRestore();
    });

    it("should cancel the pending debounce timer on unmount", () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
      setViewportWidth(1200);
      const { unmount } = renderHook(() => useResponsiveSize());

      act(() => {
        setViewportWidth(800);
        globalThis.dispatchEvent(new Event("resize"));
      });

      const clearTimeoutCallCountBeforeUnmount =
        clearTimeoutSpy.mock.calls.length;

      unmount();

      expect(clearTimeoutSpy.mock.calls.length).toBe(
        clearTimeoutCallCountBeforeUnmount + 1,
      );
      clearTimeoutSpy.mockRestore();
    });
  });

  describe("Boundary conditions", () => {
    it("should use the mobile path at exactly the breakpoint minus 1", () => {
      setViewportWidth(639);
      const { result } = renderHook(() => useResponsiveSize());
      // mobile: 639 - 40 = 599, capped at 500
      expect(result.current).toBe(500);
    });

    it("should use the desktop path at exactly the breakpoint", () => {
      setViewportWidth(640);
      const { result } = renderHook(() => useResponsiveSize());
      // desktop: 640 * 0.75 = 480
      expect(result.current).toBe(480);
    });
  });
});
