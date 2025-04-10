import { render, screen, fireEvent, within } from "@testing-library/react";
import { Legend } from "../Legend";
import { Preparedness } from "../../types";
import { RING_COLORS } from "../../constants/colors";

describe("Legend", () => {
  describe("Basic Rendering", () => {
    beforeEach(() => {
      render(<Legend />);
    });

    it("should render all section headings", () => {
      expect(
        screen.getByRole("heading", { name: "Legend" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Size (Relevance)" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Color (Preparedness)" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Rings (Likelihood)" }),
      ).toBeInTheDocument();
    });

    it("should display all preparedness levels", () => {
      for (const preparedness of Object.values(Preparedness)) {
        expect(screen.getByText(preparedness)).toBeInTheDocument();
      }
    });

    it("should display all ring levels", () => {
      const likelihoodSection = screen.getByRole("heading", {
        name: "Rings (Likelihood)",
      }).parentElement!;

      for (const color of RING_COLORS) {
        expect(
          within(likelihoodSection).getByText(color.label),
        ).toBeInTheDocument();
      }
    });

    it("should display help text", () => {
      expect(
        screen.getByText("Click on any point to view and edit its details."),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Points are positioned based on their category (quadrant) and likelihood (ring).",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Interaction", () => {
    it("should support collapsing and expanding", () => {
      render(<Legend />);

      const button = screen.getByRole("button", { name: "Legend" });
      const content = screen.getByTestId("legend-content");

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
});
