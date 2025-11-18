import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileOperations } from "../file-operations";
import { useDiagramStore } from "../../store/use-diagram-store";
import { vi } from "vitest";

vi.mock("../../store/use-diagram-store");
const mockedUseDiagramStore = useDiagramStore as unknown as ReturnType<typeof vi.fn>;

describe("FileOperations", () => {
  const mockSaveDiagram = vi.fn();
  const mockLoadDiagram = vi.fn();
  const user = userEvent.setup();
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
    mockedUseDiagramStore.mockReturnValue({
      saveDiagram: mockSaveDiagram,
      loadDiagram: mockLoadDiagram,
    });
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
