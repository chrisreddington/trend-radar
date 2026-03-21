import { render } from "@testing-library/react";
import { DiagramPersistenceWatcher } from "../diagram-persistence-watcher";
import { vi } from "vitest";

vi.mock("../../hooks/use-diagram-persistence", () => ({
  useDiagramPersistence: vi.fn(),
}));

import { useDiagramPersistence } from "../../hooks/use-diagram-persistence";

describe("DiagramPersistenceWatcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call useDiagramPersistence on mount", () => {
    render(<DiagramPersistenceWatcher />);
    expect(useDiagramPersistence).toHaveBeenCalledTimes(1);
  });

  it("should render nothing visible", () => {
    const { container } = render(<DiagramPersistenceWatcher />);
    expect(container.firstChild).toBeNull();
  });
});
