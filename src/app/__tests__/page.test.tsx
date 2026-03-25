import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

// Mock the store before any component imports resolve.
vi.mock("../../store/use-diagram-store", async () => {
  const actual = await vi.importActual<
    typeof import("../../store/use-diagram-store")
  >("../../store/use-diagram-store");
  return {
    ...actual,
    useDiagramStore: vi.fn(),
  };
});

// DiagramPersistenceWatcher calls this hook on every render.
vi.mock("../../hooks/use-diagram-persistence", () => ({
  useDiagramPersistence: vi.fn(),
}));

import Home from "../page";
import { useDiagramStore } from "../../store/use-diagram-store";

const DEFAULT_STORE_STATE = {
  points: [],
  selectedPoint: undefined,
  selectPoint: vi.fn(),
  updatePoint: vi.fn(),
  addPointAtPosition: vi.fn(),
  addPoint: vi.fn(),
  removePoint: vi.fn(),
  saveDiagram: vi.fn(),
  loadDiagram: vi.fn(),
};

describe("Home page", () => {
  const originalMatchMedia = globalThis.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();

    // ThemeToggle reads matchMedia to resolve the initial theme.
    Object.defineProperty(globalThis, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    // Some components call the store with a selector, others without.
    (
      useDiagramStore as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(
      (
        selector?: (s: typeof DEFAULT_STORE_STATE) => unknown,
      ) => (selector ? selector(DEFAULT_STORE_STATE) : DEFAULT_STORE_STATE),
    );
  });

  afterEach(() => {
    globalThis.matchMedia = originalMatchMedia;
  });

  describe("Layout structure", () => {
    it("renders a main content element", () => {
      render(<Home />);
      expect(screen.getByRole("main")).toBeInTheDocument();
    });
  });

  describe("Diagram section", () => {
    it("renders the ring diagram as an accessible image", () => {
      render(<Home />);
      expect(
        screen.getByRole("img", {
          name: /ring diagram showing points across different categories and rings/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("Side panel components", () => {
    it("renders the GitHub source link", () => {
      render(<Home />);
      expect(
        screen.getByRole("link", { name: /view source on github/i }),
      ).toBeInTheDocument();
    });

    it("renders theme toggle controls", () => {
      render(<Home />);
      expect(screen.getByLabelText("Light theme")).toBeInTheDocument();
      expect(screen.getByLabelText("Dark theme")).toBeInTheDocument();
      expect(screen.getByLabelText("System theme")).toBeInTheDocument();
    });

    it("renders file operations buttons", () => {
      render(<Home />);
      expect(
        screen.getByRole("button", { name: /save diagram/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /load diagram/i }),
      ).toBeInTheDocument();
    });

    it("renders the control panel with the add point form", () => {
      render(<Home />);
      expect(screen.getByText("Add New Point")).toBeInTheDocument();
    });

    it("renders the legend section", () => {
      render(<Home />);
      expect(
        screen.getByRole("heading", { name: "Legend" }),
      ).toBeInTheDocument();
    });
  });

  describe("Points table", () => {
    it("renders the points table", () => {
      render(<Home />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });
});
