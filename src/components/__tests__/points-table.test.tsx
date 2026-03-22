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

    it("should render the search input and category filter", () => {
      render(<PointsTable />);
      expect(
        screen.getByRole("searchbox", { name: "Search points by label" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("combobox", { name: "Filter by category" }),
      ).toBeInTheDocument();
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

  describe("Filtering", () => {
    it("should filter rows by label search term", () => {
      render(<PointsTable />);
      const searchInput = screen.getByRole("searchbox", {
        name: "Search points by label",
      });

      fireEvent.change(searchInput, { target: { value: "Point 1" } });

      expect(screen.getByText("Test Point 1")).toBeInTheDocument();
      expect(screen.queryByText("Test Point 2")).not.toBeInTheDocument();
    });

    it("should filter rows by category", () => {
      render(<PointsTable />);
      const categorySelect = screen.getByRole("combobox", {
        name: "Filter by category",
      });

      fireEvent.change(categorySelect, { target: { value: "Economic" } });

      expect(screen.queryByText("Test Point 1")).not.toBeInTheDocument();
      expect(screen.getByText("Test Point 2")).toBeInTheDocument();
    });

    it("should combine label search and category filter", () => {
      render(<PointsTable />);

      fireEvent.change(
        screen.getByRole("searchbox", { name: "Search points by label" }),
        { target: { value: "Point" } },
      );
      fireEvent.change(
        screen.getByRole("combobox", { name: "Filter by category" }),
        { target: { value: "Technological" } },
      );

      expect(screen.getByText("Test Point 1")).toBeInTheDocument();
      expect(screen.queryByText("Test Point 2")).not.toBeInTheDocument();
    });

    it("should show a result count when filters are active", () => {
      render(<PointsTable />);

      fireEvent.change(
        screen.getByRole("searchbox", { name: "Search points by label" }),
        { target: { value: "Point 1" } },
      );

      expect(screen.getByText(/1 of 2 shown/)).toBeInTheDocument();
    });

    it("should show an empty-state message when no rows match", () => {
      render(<PointsTable />);

      fireEvent.change(
        screen.getByRole("searchbox", { name: "Search points by label" }),
        { target: { value: "nonexistent" } },
      );

      expect(
        screen.getByText("No points match the current filters."),
      ).toBeInTheDocument();
    });

    it("should show a Clear button when filters are active and reset on click", () => {
      render(<PointsTable />);
      const searchInput = screen.getByRole("searchbox", {
        name: "Search points by label",
      });

      fireEvent.change(searchInput, { target: { value: "Point 1" } });

      const clearButton = screen.getByRole("button", { name: "Clear filters" });
      expect(clearButton).toBeInTheDocument();

      fireEvent.click(clearButton);

      expect(searchInput).toHaveValue("");
      expect(screen.getByText("Test Point 1")).toBeInTheDocument();
      expect(screen.getByText("Test Point 2")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Clear filters" }),
      ).not.toBeInTheDocument();
    });

    it("should hide the Clear button when no filters are active", () => {
      render(<PointsTable />);
      expect(
        screen.queryByRole("button", { name: "Clear filters" }),
      ).not.toBeInTheDocument();
    });

    it("should perform case-insensitive label search", () => {
      render(<PointsTable />);

      fireEvent.change(
        screen.getByRole("searchbox", { name: "Search points by label" }),
        { target: { value: "TEST POINT 1" } },
      );

      expect(screen.getByText("Test Point 1")).toBeInTheDocument();
      expect(screen.queryByText("Test Point 2")).not.toBeInTheDocument();
    });
  });
});
