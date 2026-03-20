import { useState, useCallback, useEffect } from "react";

const MOBILE_BREAKPOINT = 640;
const MAX_MOBILE_SIZE = 500;
const MOBILE_VIEWPORT_PADDING = 40;
const DESKTOP_VIEWPORT_FRACTION = 0.75;
const MAX_DESKTOP_SIZE = 800;
const DEFAULT_SIZE = 800;

/**
 * Returns a reactive size value for the ring diagram that responds to viewport changes.
 *
 * On mobile (viewport < 640px): nearly full width, capped at 500px.
 * On larger screens: 75% of viewport width, capped at 800px.
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
    const newSize =
      vw < MOBILE_BREAKPOINT
        ? Math.min(vw - MOBILE_VIEWPORT_PADDING, MAX_MOBILE_SIZE)
        : Math.min(vw * DESKTOP_VIEWPORT_FRACTION, MAX_DESKTOP_SIZE);
    setSize(newSize);
  }, []);

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  return size;
}
