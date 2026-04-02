import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileOperations } from "../file-operations";
import { vi } from "vitest";

// Mock the entire store module
vi.mock("../../store/use-diagram-store", async () => {
  const actual = await vi.importActual<
    typeof import("../../store/use-diagram-store")
  >("../../store/use-diagram-store");
  return {
    ...actual,
    useDiagramStore: vi.fn(),
  };
});

// Import after mocking
import { useDiagramStore } from "../../store/use-diagram-store";

describe("FileOperations", () => {
  const mockSaveDiagram = vi.fn();
  const mockLoadDiagram = vi.fn();
  const user = userEvent.setup();
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
    const mockState = {
      saveDiagram: mockSaveDiagram,
      loadDiagram: mockLoadDiagram,
    };
    (useDiagramStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector?: (state: typeof mockState) => unknown) =>
        selector ? selector(mockState) : mockState,
    );
  });

  afterEach(() => {
    console.error = originalConsoleError;
    vi.clearAllMocks();
  });

  it("renders save and load buttons", () => {
    render(<FileOperations />);
    expect(screen.getByText("Save Diagram")).toBeInTheDocument();
    expect(screen.getByText("Load Diagram")).toBeInTheDocument();
  });

  it("calls saveDiagram when save button is clicked", async () => {
    mockSaveDiagram.mockResolvedValue(void 0);
    render(<FileOperations />);

    await user.click(screen.getByText("Save Diagram"));
    expect(mockSaveDiagram).toHaveBeenCalledTimes(1);
    expect(console.error).not.toHaveBeenCalled();
  });

  it("calls loadDiagram when load button is clicked", async () => {
    mockLoadDiagram.mockResolvedValue(void 0);
    render(<FileOperations />);

    await user.click(screen.getByText("Load Diagram"));
    expect(mockLoadDiagram).toHaveBeenCalledTimes(1);
    expect(console.error).not.toHaveBeenCalled();
  });

  it("shows error message when save fails", async () => {
    const error = new Error("Save failed");
    mockSaveDiagram.mockRejectedValueOnce(error);
    render(<FileOperations />);

    await user.click(screen.getByText("Save Diagram"));

    // Wait for the error message to appear
    const errorMessage = await screen.findByText("Failed to save diagram");
    expect(errorMessage).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(error);
  });

  it("shows error message when load fails", async () => {
    const error = new Error("Load failed");
    mockLoadDiagram.mockRejectedValueOnce(error);
    render(<FileOperations />);

    await user.click(screen.getByText("Load Diagram"));

    // Wait for the error message to appear
    const errorMessage = await screen.findByText("Failed to load diagram");
    expect(errorMessage).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(error);
  });

  it("shows loading state while saving", async () => {
    let resolveSave!: () => void;
    mockSaveDiagram.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      }),
    );

    render(<FileOperations />);

    const saveButton = screen.getByRole("button", { name: "Save Diagram" });
    const loadButton = screen.getByRole("button", { name: "Load Diagram" });

    await user.click(saveButton);

    expect(screen.getByRole("button", { name: "Saving…" })).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
    expect(loadButton).toBeDisabled();

    resolveSave();
    expect(await screen.findByRole("button", { name: "Save Diagram" })).toBeEnabled();
  });

  it("shows loading state while loading", async () => {
    let resolveLoad!: () => void;
    mockLoadDiagram.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveLoad = resolve;
      }),
    );

    render(<FileOperations />);

    const saveButton = screen.getByRole("button", { name: "Save Diagram" });
    const loadButton = screen.getByRole("button", { name: "Load Diagram" });

    await user.click(loadButton);

    expect(screen.getByRole("button", { name: "Loading…" })).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
    expect(loadButton).toBeDisabled();

    resolveLoad();
    expect(await screen.findByRole("button", { name: "Load Diagram" })).toBeEnabled();
  });

  it("re-enables buttons after save fails", async () => {
    mockSaveDiagram.mockRejectedValueOnce(new Error("Save failed"));
    render(<FileOperations />);

    await user.click(screen.getByRole("button", { name: "Save Diagram" }));

    expect(await screen.findByRole("button", { name: "Save Diagram" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Load Diagram" })).toBeEnabled();
  });

  it("re-enables buttons after load fails", async () => {
    mockLoadDiagram.mockRejectedValueOnce(new Error("Load failed"));
    render(<FileOperations />);

    await user.click(screen.getByRole("button", { name: "Load Diagram" }));

    expect(await screen.findByRole("button", { name: "Load Diagram" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Save Diagram" })).toBeEnabled();
  });

  it("clears error message when operation succeeds after previous error", async () => {
    mockSaveDiagram
      .mockRejectedValueOnce(new Error("Save failed"))
      .mockResolvedValue(void 0);

    render(<FileOperations />);

    // First attempt fails
    await user.click(screen.getByText("Save Diagram"));
    const errorMessage = await screen.findByText("Failed to save diagram");
    expect(errorMessage).toBeInTheDocument();

    // Second attempt succeeds
    await user.click(screen.getByText("Save Diagram"));
    expect(
      screen.queryByText("Failed to save diagram"),
    ).not.toBeInTheDocument();
  });
});
