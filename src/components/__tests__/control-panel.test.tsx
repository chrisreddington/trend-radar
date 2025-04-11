import { render, screen, fireEvent, within } from "@testing-library/react";
import { ControlPanel } from "../control-panel";
import { useDiagramStore } from "../../store/use-diagram-store";
import { Category, Likelihood, Relevance, Preparedness } from "../../types";

jest.mock("../../store/useDiagramStore");
const mockedUseDiagramStore = useDiagramStore as unknown as jest.MockedFunction<
  typeof useDiagramStore
>;

describe("ControlPanel", () => {
  // Common test data
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
  };

  // Helper to get store with optional selected point
  const getStoreState = (selectedPoint: string | undefined) => ({
    points: [mockPoint],
    selectedPoint,
    ...mockActions,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseDiagramStore.mockReturnValue(getStoreState(""));
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

      fireEvent.submit(screen.getByRole("form"));

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
        const likelihoodSlider = screen.getByRole("slider", {
          name: /Likelihood/,
        });

        const testCases = [
          { value: "90", expected: Likelihood.HighlyLikely },
          { value: "70", expected: Likelihood.Likely },
          { value: "50", expected: Likelihood.Average },
          { value: "30", expected: Likelihood.Unlikely },
          { value: "10", expected: Likelihood.HighlyUnlikely },
        ];

        for (const { value, expected } of testCases) {
          fireEvent.change(likelihoodSlider, { target: { value } });
          fireEvent.submit(screen.getByRole("form"));

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
        const relevanceSlider = screen.getByRole("slider", {
          name: /Relevance/,
        });

        const testCases = [
          { value: "80", expected: Relevance.High },
          { value: "50", expected: Relevance.Moderate },
          { value: "20", expected: Relevance.Low },
        ];

        for (const { value, expected } of testCases) {
          fireEvent.change(relevanceSlider, { target: { value } });
          fireEvent.submit(screen.getByRole("form"));

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
        const preparednessSlider = screen.getByRole("slider", {
          name: /Preparedness/,
        });

        const testCases = [
          { value: "80", expected: Preparedness.HighlyPrepared },
          { value: "50", expected: Preparedness.ModeratelyPrepared },
          { value: "20", expected: Preparedness.InadequatelyPrepared },
        ];

        for (const { value, expected } of testCases) {
          fireEvent.change(preparednessSlider, { target: { value } });
          fireEvent.submit(screen.getByRole("form"));

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
      mockedUseDiagramStore.mockReturnValue(getStoreState("1"));
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
        mockedUseDiagramStore.mockReturnValue(getStoreState(""));
        rerender(<ControlPanel />);

        // Verify edit form is removed
        expect(
          screen.queryByText("Edit Selected Point"),
        ).not.toBeInTheDocument();
      });

      it("should update editing state when selected point changes", () => {
        const firstPoint = { ...mockPoint, id: "1", label: "First Point" };
        const secondPoint = { ...mockPoint, id: "2", label: "Second Point" };

        const getStoreWithPoints = (selectedId: string | null) => ({
          points: [firstPoint, secondPoint],
          selectedPoint: selectedId,
          ...mockActions,
        });

        mockedUseDiagramStore.mockReturnValue(getStoreWithPoints("1"));
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
        mockedUseDiagramStore.mockReturnValue(getStoreWithPoints("2"));
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
});
