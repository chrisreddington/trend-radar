import { render, screen, fireEvent } from "@testing-library/react";
import { PointsTable } from "../points-table";
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

const getRowCellText = (rowIndex: number, colIndex: number) => {
  const rows = screen.getAllByRole("row").slice(1) as HTMLTableRowElement[];
  return rows[rowIndex].cells[colIndex].textContent;
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
    const state = { points: mockPoints };
    (useDiagramStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector?: (s: typeof state) => unknown) =>
        selector ? selector(state) : state,
    );
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

  describe("Ordinal sorting", () => {
    // These tests use a third point so alphabetical and ordinal orders diverge.
    // "Low" relevance sorts after "Moderate" ordinally but before it alphabetically.
    // "Inadequately Prepared" sorts after "Moderately Prepared" ordinally but before alphabetically.
    // "Unlikely" sorts after "Likely" ordinally but before alphabetically.
    const threePoints = [
      {
        id: "1",
        label: "Point A",
        category: "Technological",
        relevance: "High",
        preparedness: "Highly Prepared",
        likelihood: "Highly Likely",
        x: 0,
        y: 0,
      },
      {
        id: "2",
        label: "Point B",
        category: "Economic",
        relevance: "Moderate",
        preparedness: "Moderately Prepared",
        likelihood: "Likely",
        x: 0,
        y: 0,
      },
      {
        id: "3",
        label: "Point C",
        category: "Social",
        relevance: "Low",
        preparedness: "Inadequately Prepared",
        likelihood: "Unlikely",
        x: 0,
        y: 0,
      },
    ];

    beforeEach(() => {
      const state = { points: threePoints };
      (
        useDiagramStore as unknown as ReturnType<typeof vi.fn>
      ).mockImplementation(
        (selector?: (s: typeof state) => unknown) =>
          selector ? selector(state) : state,
      );
    });

    it("should sort relevance in ordinal order (High → Moderate → Low), not alphabetically", () => {
      expect.hasAssertions();
      render(<PointsTable />);
      const colIndex = screen
        .getAllByRole("columnheader")
        .findIndex((h) => h.textContent?.includes("Relevance"));

      // Ascending: highest relevance first
      fireEvent.click(getColumnHeader("Relevance"));
      expect(getRowCellText(0, colIndex)).toBe("High");
      expect(getRowCellText(1, colIndex)).toBe("Moderate");
      expect(getRowCellText(2, colIndex)).toBe("Low");

      // Descending: lowest relevance first
      fireEvent.click(getColumnHeader("Relevance"));
      expect(getRowCellText(0, colIndex)).toBe("Low");
      expect(getRowCellText(1, colIndex)).toBe("Moderate");
      expect(getRowCellText(2, colIndex)).toBe("High");
    });

    it("should sort preparedness in ordinal order (Highly Prepared → Moderately → Inadequately), not alphabetically", () => {
      expect.hasAssertions();
      render(<PointsTable />);
      const colIndex = screen
        .getAllByRole("columnheader")
        .findIndex((h) => h.textContent?.includes("Preparedness"));

      // Ascending: most prepared first
      fireEvent.click(getColumnHeader("Preparedness"));
      expect(getRowCellText(0, colIndex)).toBe("Highly Prepared");
      expect(getRowCellText(1, colIndex)).toBe("Moderately Prepared");
      expect(getRowCellText(2, colIndex)).toBe("Inadequately Prepared");

      // Descending: least prepared first
      fireEvent.click(getColumnHeader("Preparedness"));
      expect(getRowCellText(0, colIndex)).toBe("Inadequately Prepared");
      expect(getRowCellText(1, colIndex)).toBe("Moderately Prepared");
      expect(getRowCellText(2, colIndex)).toBe("Highly Prepared");
    });

    it("should sort likelihood in ordinal order (Highly Likely → Likely → Unlikely), not alphabetically", () => {
      expect.hasAssertions();
      render(<PointsTable />);
      const colIndex = screen
        .getAllByRole("columnheader")
        .findIndex((h) => h.textContent?.includes("Likelihood"));

      // Ascending: most likely first
      fireEvent.click(getColumnHeader("Likelihood"));
      expect(getRowCellText(0, colIndex)).toBe("Highly Likely");
      expect(getRowCellText(1, colIndex)).toBe("Likely");
      expect(getRowCellText(2, colIndex)).toBe("Unlikely");

      // Descending: least likely first
      fireEvent.click(getColumnHeader("Likelihood"));
      expect(getRowCellText(0, colIndex)).toBe("Unlikely");
      expect(getRowCellText(1, colIndex)).toBe("Likely");
      expect(getRowCellText(2, colIndex)).toBe("Highly Likely");
    });
  });
});
