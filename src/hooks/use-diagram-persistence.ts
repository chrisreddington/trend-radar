import { useEffect, useRef } from "react";
import { useDiagramStore } from "../store/use-diagram-store";

/** Milliseconds to wait after the last points change before writing to localStorage. */
const SAVE_DEBOUNCE_MS = 300;

/**
 * Wires up automatic localStorage persistence for the diagram store.
 *
 * On mount, any previously saved state is loaded from localStorage so the
 * user's work survives page refreshes. After mount, every change to `points`
 * triggers a debounced save via the store's `saveState` action. Debouncing
 * prevents excessive localStorage writes during rapid interactions such as
 * dragging points across the diagram (which can fire dozens of store updates
 * per second at animation-frame rates).
 *
 * Intended to be called once at the application root (e.g. `page.tsx`).
 */
export function useDiagramPersistence(): void {
  const saveTimeoutReference = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    const diagramStoreState = useDiagramStore.getState();

    try {
      diagramStoreState.loadState();
    } catch (error) {
      // Swallow errors from localStorage/JSON parsing so a corrupted persisted
      // state cannot crash the app during hydration or mount.
      console.error("Failed to load persisted diagram state:", error);
    }

    let previousPoints = diagramStoreState.points;
    const unsubscribe = useDiagramStore.subscribe((state) => {
      if (state.points !== previousPoints) {
        previousPoints = state.points;
        clearTimeout(saveTimeoutReference.current);
        saveTimeoutReference.current = setTimeout(() => {
          state.saveState();
        }, SAVE_DEBOUNCE_MS);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(saveTimeoutReference.current);
    };
  }, []);
}
