import { render, screen, fireEvent } from "@testing-library/react";
import { PointsTable } from "../points-table";
import { useDiagramStore } from "../../store/use-diagram-store";
import { vi } from "vitest";

vi.mock("../../store/use-diagram-store");
const mockedUseDiagramStore = useDiagramStore as unknown as ReturnType<typeof vi.fn>;

// Helper functions for sorting tests
const getColumnHeader = (columnName: string) => {
  return screen.getByRole("columnheader", {
    name: new RegExp(`^${columnName}( ↑| ↓)?$`),
  });
};

const testColumnSorting = (
  columnName: string,
  firstValue: string,
  secondValue: string,
) => {
  const getCellIndex = () => {
    const headers = screen.getAllByRole("columnheader");
    return headers.findIndex((header) =>
      header.textContent?.includes(columnName),
    );
  };

  const getCellText = (row: HTMLTableRowElement, cellIndex: number) =>
    row.cells[cellIndex].textContent;

  // Initial click for ascending sort
  fireEvent.click(getColumnHeader(columnName));

  let sortedRows = screen.getAllByRole("row").slice(1) as HTMLTableRowElement[];
  const cellIndex = getCellIndex();
  expect(getCellText(sortedRows[0], cellIndex)).toBe(firstValue);
  expect(getCellText(sortedRows[1], cellIndex)).toBe(secondValue);
  expect(getColumnHeader(columnName)).toHaveTextContent(/↑$/);

  // Click again for descending sort
  fireEvent.click(getColumnHeader(columnName));

  sortedRows = screen.getAllByRole("row").slice(1) as HTMLTableRowElement[];
  expect(getCellText(sortedRows[0], cellIndex)).toBe(secondValue);
  expect(getCellText(sortedRows[1], cellIndex)).toBe(firstValue);
  expect(getColumnHeader(columnName)).toHaveTextContent(/↓$/);
};

describe("PointsTable", () => {
  // Common test data
  const mockPoints = [
    {
      id: "1",
      label: "Test Point 1",
      category: "Technological",
      relevance: "High",
      preparedness: "Highly Prepared",
      likelihood: "Highly Likely",
      x: 0,
      y: 0,
    },
    {
      id: "2",
      label: "Test Point 2",
      category: "Economic",
      relevance: "Moderate",
      preparedness: "Moderately Prepared",
      likelihood: "Likely",
      x: 0,
      y: 0,
    },
  ];

  beforeEach(() => {
    mockedUseDiagramStore.mockReturnValue({
      points: mockPoints,
    });
  });

  describe("Basic Rendering", () => {
    it("should render table with column headers and data", () => {
      render(<PointsTable />);
      expect(screen.getByText("Points Table")).toBeInTheDocument();
      expect(screen.getByText("Test Point 1")).toBeInTheDocument();
      expect(screen.getByText("Test Point 2")).toBeInTheDocument();
    });

    it("should support collapsing and expanding the table", () => {
      render(<PointsTable />);
      const button = screen.getByRole("button", {
        name: "Points Table Toggle",
      });
      const content = screen.getByRole("table").parentElement?.parentElement;

      expect(content).toBeInTheDocument();
      expect(content).not.toHaveClass("hidden");

      fireEvent.click(button);
      expect(content).toHaveClass("hidden");

      fireEvent.click(button);
      expect(content).not.toHaveClass("hidden");
    });
  });

  describe("Sorting", () => {
    it("should sort by label in both directions", () => {
      expect.hasAssertions();
      render(<PointsTable />);
      testColumnSorting("Label", "Test Point 1", "Test Point 2");
    });

    it("should sort by category in both directions", () => {
      expect.hasAssertions();
      render(<PointsTable />);
      testColumnSorting("Category", "Economic", "Technological");
    });

    it("should sort by relevance in both directions", () => {
      expect.hasAssertions();
      render(<PointsTable />);
      testColumnSorting("Relevance", "High", "Moderate");
    });

    it("should sort by preparedness in both directions", () => {
      expect.hasAssertions();
      render(<PointsTable />);
      testColumnSorting(
        "Preparedness",
        "Highly Prepared",
        "Moderately Prepared",
      );
    });

    it("should sort by likelihood in both directions", () => {
      expect.hasAssertions();
      render(<PointsTable />);
      testColumnSorting("Likelihood", "Highly Likely", "Likely");
    });

    it("should handle changing sort column", () => {
      expect.hasAssertions();
      render(<PointsTable />);

      fireEvent.click(getColumnHeader("Label"));
      expect(getColumnHeader("Label")).toHaveTextContent(/↑$/);

      fireEvent.click(getColumnHeader("Category"));
      expect(getColumnHeader("Category")).toHaveTextContent(/↑$/);
      expect(getColumnHeader("Label")).toHaveTextContent(/^Label$/);
    });
  });
});
