"use client";
import { useDiagramPersistence } from "../hooks/use-diagram-persistence";

/**
 * Invisible component that activates diagram auto-save/load behaviour.
 *
 * Renders nothing; its sole purpose is to call {@link useDiagramPersistence}
 * inside the React tree so the hook runs on the client.
 */
export function DiagramPersistenceWatcher() {
  useDiagramPersistence();
  return <></>;
}
