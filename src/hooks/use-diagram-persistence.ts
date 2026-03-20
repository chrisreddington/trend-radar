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
    useDiagramStore.getState().loadState();

    let previousPoints = useDiagramStore.getState().points;

    const unsubscribe = useDiagramStore.subscribe((state) => {
      if (state.points !== previousPoints) {
        previousPoints = state.points;
        state.saveState();
      }
    });

    return unsubscribe;
  }, []);
}
