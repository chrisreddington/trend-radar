import { useState, useCallback, useEffect } from "react";

const MOBILE_BREAKPOINT = 640;
const MAX_MOBILE_SIZE = 500;
const MOBILE_VIEWPORT_PADDING = 40;
const DESKTOP_VIEWPORT_FRACTION = 0.75;
const MAX_DESKTOP_SIZE = 800;
const DEFAULT_SIZE = 800;
/** Milliseconds to wait after the last resize event before recalculating size. */
const RESIZE_DEBOUNCE_MS = 150;

/**
 * Returns a reactive size value for the ring diagram that responds to viewport changes.
 *
 * On mobile (viewport < 640px): nearly full width, capped at 500px.
 * On larger screens: 75% of viewport width, capped at 800px.
 *
 * Resize events are debounced by {@link RESIZE_DEBOUNCE_MS} ms to avoid
 * triggering a full SVG rebuild on every pixel of window resize movement.
 *
 * @returns Current diagram size in pixels.
 */
export function useResponsiveSize(): number {
  const [size, setSize] = useState(DEFAULT_SIZE);

  const updateSize = useCallback(() => {
    const vw = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0,
    );
    const mobileSize = Math.max(vw - MOBILE_VIEWPORT_PADDING, 0);
    const newSize =
      vw < MOBILE_BREAKPOINT
        ? Math.min(mobileSize, MAX_MOBILE_SIZE)
        : Math.min(vw * DESKTOP_VIEWPORT_FRACTION, MAX_DESKTOP_SIZE);
    setSize(newSize);
  }, []);

  useEffect(() => {
    updateSize();

    let debounceTimer: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateSize, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [updateSize]);

  return size;
}
