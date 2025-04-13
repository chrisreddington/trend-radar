import { render, screen, fireEvent } from "@testing-library/react";
import { FileOperations } from "../file-operations";
import { useDiagramStore } from "../../store/use-diagram-store";

jest.mock("../../store/use-diagram-store");
const mockedUseDiagramStore = useDiagramStore as unknown as jest.MockedFunction<
  typeof useDiagramStore
>;

describe("FileOperations", () => {
  const mockSaveDiagram = jest.fn();
  const mockLoadDiagram = jest.fn();

  beforeEach(() => {
    mockedUseDiagramStore.mockReturnValue({
      saveDiagram: mockSaveDiagram,
      loadDiagram: mockLoadDiagram,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders save and load buttons", () => {
    render(<FileOperations />);
    expect(screen.getByText("Save Diagram")).toBeInTheDocument();
    expect(screen.getByText("Load Diagram")).toBeInTheDocument();
  });

  it("calls saveDiagram when save button is clicked", async () => {
    mockSaveDiagram.mockResolvedValue(null);
    render(<FileOperations />);
    
    await fireEvent.click(screen.getByText("Save Diagram"));
    expect(mockSaveDiagram).toHaveBeenCalledTimes(1);
  });

  it("calls loadDiagram when load button is clicked", async () => {
    mockLoadDiagram.mockResolvedValue(null);
    render(<FileOperations />);
    
    await fireEvent.click(screen.getByText("Load Diagram"));
    expect(mockLoadDiagram).toHaveBeenCalledTimes(1);
  });

  it("shows error message when save fails", async () => {
    mockSaveDiagram.mockRejectedValueOnce(new Error("Save failed"));
    render(<FileOperations />);
    
    await fireEvent.click(screen.getByText("Save Diagram"));
    expect(screen.getByText("Failed to save diagram")).toBeInTheDocument();
  });

  it("shows error message when load fails", async () => {
    mockLoadDiagram.mockRejectedValueOnce(new Error("Load failed"));
    render(<FileOperations />);
    
    await fireEvent.click(screen.getByText("Load Diagram"));
    expect(screen.getByText("Failed to load diagram")).toBeInTheDocument();
  });

  it("clears error message when operation succeeds after previous error", async () => {
    mockSaveDiagram
      .mockRejectedValueOnce(new Error("Save failed"))
      .mockResolvedValue(null);
    
    render(<FileOperations />);
    
    // First attempt fails
    await fireEvent.click(screen.getByText("Save Diagram"));
    expect(screen.getByText("Failed to save diagram")).toBeInTheDocument();
    
    // Second attempt succeeds
    await fireEvent.click(screen.getByText("Save Diagram"));
    expect(
      screen.queryByText("Failed to save diagram"),
    ).not.toBeInTheDocument();
  });
});