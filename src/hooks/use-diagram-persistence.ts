import { useEffect } from "react";
import { useDiagramStore } from "../store/use-diagram-store";

/**
 * Wires up automatic localStorage persistence for the diagram store.
 *
 * On mount, any previously saved state is loaded from localStorage so the
 * user's work survives page refreshes. After mount, every change to `points`
 * is saved automatically via the store's `saveState` action.
 *
 * Intended to be called once at the application root (e.g. `page.tsx`).
 */
export function useDiagramPersistence(): void {
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
        state.saveState();
      }
    });

    return unsubscribe;
  }, []);
}
