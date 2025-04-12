import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ControlPanel } from "../control-panel";
import { Category, Likelihood, Relevance, Preparedness } from "../../types";

// Mock the entire store module
jest.mock("../../store/use-diagram-store", () => {
  const actual = jest.requireActual("../../store/use-diagram-store");
  return {
    ...actual,
    useDiagramStore: jest.fn(),
    saveDiagram: jest.fn(),
    loadDiagram: jest.fn(),
  };
});

// Import after mocking
import { useDiagramStore } from "../../store/use-diagram-store";

describe("ControlPanel", () => {
  // Common test data and setup
  const user = userEvent.setup();

  const mockPoint = {
    id: "1",
    label: "Test Point",
    category: Category.Technological,
    likelihood: Likelihood.Average,
    relevance: Relevance.Moderate,
    preparedness: Preparedness.ModeratelyPrepared,
    x: 0,
    y: 0,
  };

  // Mock store actions
  const mockActions = {
    addPoint: jest.fn(),
    updatePoint: jest.fn(),
    removePoint: jest.fn(),
    selectPoint: jest.fn(),
    saveDiagram: jest.fn(),
    loadDiagram: jest.fn(),
  };

  // Helper to get store with optional selected point
  const getStoreState = (selectedPoint?: string) => ({
    points: [mockPoint],
    selectedPoint,
    ...mockActions,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useDiagramStore as jest.Mock).mockImplementation(() => getStoreState());
  });

  describe("Basic Rendering", () => {
    it("should render add point form with all inputs", () => {
      render(<ControlPanel />);
      expect(screen.getByText("Add New Point")).toBeInTheDocument();
      expect(screen.getByLabelText("Label")).toBeInTheDocument();
      expect(screen.getByLabelText("Category")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add Point" }),
      ).toBeInTheDocument();
    });

    it("should support collapsing and expanding the panel", () => {
      render(<ControlPanel />);
      const button = screen.getByRole("button", {
        name: "Add New Point Toggle",
      });
      const content = screen.getByTestId("add-point-form-content");

      // Initially expanded
      expect(content).not.toHaveClass("hidden");

      // Collapse
      fireEvent.click(button);
      expect(content).toHaveClass("hidden");

      // Expand
      fireEvent.click(button);
      expect(content).not.toHaveClass("hidden");
    });
  });

  describe("Adding Points", () => {
    it("should add new point with default values when only label is provided", () => {
      render(<ControlPanel />);

      fireEvent.change(screen.getByLabelText("Label"), {
        target: { value: "New Point" },
      });

      fireEvent.submit(screen.getByTestId("add-point-form"));

      expect(mockActions.addPoint).toHaveBeenCalledWith(
        expect.objectContaining({
          label: "New Point",
          category: Category.Technological,
          likelihood: Likelihood.Average,
          relevance: Relevance.Moderate,
          preparedness: Preparedness.ModeratelyPrepared,
        }),
      );
    });

    describe("Form Value Conversions", () => {
      it("should convert likelihood slider values to correct enum values", () => {
        render(<ControlPanel />);
        const likelihoodSlider = screen.getByTestId("likelihood-slider");

        const testCases = [
          { value: "90", expected: Likelihood.HighlyLikely },
          { value: "70", expected: Likelihood.Likely },
          { value: "50", expected: Likelihood.Average },
          { value: "30", expected: Likelihood.Unlikely },
          { value: "10", expected: Likelihood.HighlyUnlikely },
        ];

        for (const { value, expected } of testCases) {
          fireEvent.change(likelihoodSlider, { target: { value } });
          fireEvent.submit(screen.getByTestId("add-point-form"));

          expect(mockActions.addPoint).toHaveBeenCalledWith(
            expect.objectContaining({
              likelihood: expected,
            }),
          );

          jest.clearAllMocks();
        }
      });

      it("should convert relevance slider values to correct enum values", () => {
        render(<ControlPanel />);
        const relevanceSlider = screen.getByTestId("relevance-slider");

        const testCases = [
          { value: "80", expected: Relevance.High },
          { value: "50", expected: Relevance.Moderate },
          { value: "20", expected: Relevance.Low },
        ];

        for (const { value, expected } of testCases) {
          fireEvent.change(relevanceSlider, { target: { value } });
          fireEvent.submit(screen.getByTestId("add-point-form"));

          expect(mockActions.addPoint).toHaveBeenCalledWith(
            expect.objectContaining({
              relevance: expected,
            }),
          );

          jest.clearAllMocks();
        }
      });

      it("should convert preparedness slider values to correct enum values", () => {
        render(<ControlPanel />);
        const preparednessSlider = screen.getByTestId("preparedness-slider");

        const testCases = [
          { value: "80", expected: Preparedness.HighlyPrepared },
          { value: "50", expected: Preparedness.ModeratelyPrepared },
          { value: "20", expected: Preparedness.InadequatelyPrepared },
        ];

        for (const { value, expected } of testCases) {
          fireEvent.change(preparednessSlider, { target: { value } });
          fireEvent.submit(screen.getByTestId("add-point-form"));

          expect(mockActions.addPoint).toHaveBeenCalledWith(
            expect.objectContaining({
              preparedness: expected,
            }),
          );

          jest.clearAllMocks();
        }
      });
    });
  });

  describe("Editing Points", () => {
    beforeEach(() => {
      (useDiagramStore as jest.Mock).mockImplementation(() =>
        getStoreState("1"),
      );
    });

    it("should display selected point data in edit form", () => {
      render(<ControlPanel />);

      const editSection = screen
        .getByText("Edit Selected Point")
        .closest("div")?.parentElement;
      if (!editSection) {
        throw new Error("Edit section not found");
      }
      const labelInput = within(editSection).getByLabelText(
        "Label",
      ) as HTMLInputElement;
      expect(labelInput.value).toBe("Test Point");

      expect(
        screen.getByRole("button", { name: "Update Point" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Delete Point" }),
      ).toBeInTheDocument();
    });

    it("should update point when edit form is submitted", () => {
      render(<ControlPanel />);

      const editSection = screen
        .getByText("Edit Selected Point")
        .closest("div")?.parentElement;
      if (!editSection) {
        throw new Error("Edit section not found");
      }
      const labelInput = within(editSection).getByLabelText("Label");
      fireEvent.change(labelInput, { target: { value: "Updated Point" } });

      const updateButton = screen.getByRole("button", { name: "Update Point" });
      fireEvent.click(updateButton);

      expect(mockActions.updatePoint).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          label: "Updated Point",
        }),
      );
    });

    it("should remove point when delete button is clicked", () => {
      render(<ControlPanel />);

      fireEvent.click(screen.getByRole("button", { name: "Delete Point" }));

      expect(mockActions.removePoint).toHaveBeenCalledWith("1");
    });

    it("should preserve editing state while updating point", () => {
      render(<ControlPanel />);

      // Find edit section and start editing the point
      const editSection = screen
        .getByText("Edit Selected Point")
        .closest("div")?.parentElement;
      if (!editSection) {
        throw new Error("Edit section not found");
      }
      const labelInput = within(editSection).getByLabelText("Label");
      fireEvent.change(labelInput, { target: { value: "Updated Point" } });

      // Verify the edit form stays visible
      expect(screen.getByText("Edit Selected Point")).toBeInTheDocument();

      // Submit the update
      const updateButton = screen.getByRole("button", { name: "Update Point" });
      fireEvent.click(updateButton);

      // Verify edit form is still shown after update
      expect(screen.getByText("Edit Selected Point")).toBeInTheDocument();
      expect(mockActions.updatePoint).toHaveBeenCalled();
    });

    describe("State Management", () => {
      it("should clear editing state when point is deselected", () => {
        const { rerender } = render(<ControlPanel />);

        // Verify edit form is shown initially
        expect(screen.getByText("Edit Selected Point")).toBeInTheDocument();

        // Simulate point deselection
        (useDiagramStore as jest.Mock).mockImplementation(() =>
          getStoreState(),
        );
        rerender(<ControlPanel />);

        // Verify edit form is removed
        expect(
          screen.queryByText("Edit Selected Point"),
        ).not.toBeInTheDocument();
      });

      it("should update editing state when selected point changes", () => {
        const firstPoint = { ...mockPoint, id: "1", label: "First Point" };
        const secondPoint = { ...mockPoint, id: "2", label: "Second Point" };

        const getStoreWithPoints = (selectedId?: string) => ({
          points: [firstPoint, secondPoint],
          selectedPoint: selectedId,
          ...mockActions,
        });

        (useDiagramStore as jest.Mock).mockImplementation(() =>
          getStoreWithPoints("1"),
        );
        const { rerender } = render(<ControlPanel />);

        // Verify first point's label
        const editSection = screen
          .getByText("Edit Selected Point")
          .closest("div")?.parentElement;
        if (!editSection) {
          throw new Error("Edit section not found");
        }
        let labelInput = within(editSection).getByLabelText(
          "Label",
        ) as HTMLInputElement;
        expect(labelInput.value).toBe("First Point");

        // Change selection to second point
        (useDiagramStore as jest.Mock).mockImplementation(() =>
          getStoreWithPoints("2"),
        );
        rerender(<ControlPanel />);

        // Verify second point's label
        const newEditSection = screen
          .getByText("Edit Selected Point")
          .closest("div")?.parentElement;
        if (!newEditSection) {
          throw new Error("Edit section not found");
        }
        labelInput = within(newEditSection).getByLabelText(
          "Label",
        ) as HTMLInputElement;
        expect(labelInput.value).toBe("Second Point");
      });
    });
  });

  describe("File Operations", () => {
    it("should render file operation buttons", () => {
      render(<ControlPanel />);
      expect(screen.getByRole("button", { name: "Save Diagram" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Load Diagram" })).toBeInTheDocument();
    });

    it("should handle successful save operation", async () => {
      const mockSaveDiagram = jest.fn().mockResolvedValue(undefined);
      (useDiagramStore as jest.Mock).mockImplementation(() => ({
        ...getStoreState(),
        saveDiagram: mockSaveDiagram,
      }));

      render(<ControlPanel />);
      await user.click(screen.getByRole("button", { name: "Save Diagram" }));

      expect(mockSaveDiagram).toHaveBeenCalled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should handle failed save operation", async () => {
      const mockSaveDiagram = jest.fn().mockRejectedValue(new Error("Save failed"));
      (useDiagramStore as jest.Mock).mockImplementation(() => ({
        ...getStoreState(),
        saveDiagram: mockSaveDiagram,
      }));

      render(<ControlPanel />);
      await user.click(screen.getByRole("button", { name: "Save Diagram" }));

      expect(mockSaveDiagram).toHaveBeenCalled();
      expect(screen.getByRole("alert")).toHaveTextContent("Failed to save diagram");
    });

    it("should handle successful load operation", async () => {
      const mockLoadDiagram = jest.fn().mockResolvedValue(undefined);
      (useDiagramStore as jest.Mock).mockImplementation(() => ({
        ...getStoreState(),
        loadDiagram: mockLoadDiagram,
      }));

      render(<ControlPanel />);
      await user.click(screen.getByRole("button", { name: "Load Diagram" }));

      expect(mockLoadDiagram).toHaveBeenCalled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should handle failed load operation", async () => {
      const mockLoadDiagram = jest.fn().mockRejectedValue(new Error("Load failed"));
      (useDiagramStore as jest.Mock).mockImplementation(() => ({
        ...getStoreState(),
        loadDiagram: mockLoadDiagram,
      }));

      render(<ControlPanel />);
      await user.click(screen.getByRole("button", { name: "Load Diagram" }));

      expect(mockLoadDiagram).toHaveBeenCalled();
      expect(screen.getByRole("alert")).toHaveTextContent("Failed to load diagram");
    });

    it("should clear error when starting new operation", async () => {
      const mockSaveDiagram = jest.fn()
        .mockRejectedValueOnce(new Error("Save failed"))
        .mockResolvedValueOnce(undefined);
      
      (useDiagramStore as jest.Mock).mockImplementation(() => ({
        ...getStoreState(),
        saveDiagram: mockSaveDiagram,
      }));

      render(<ControlPanel />);

      // First operation fails
      await user.click(screen.getByRole("button", { name: "Save Diagram" }));
      expect(screen.getByRole("alert")).toBeInTheDocument();

      // Second operation succeeds and clears error
      await user.click(screen.getByRole("button", { name: "Save Diagram" }));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
