import { render, screen, fireEvent, within } from "@testing-library/react";
import { Legend } from "../legend";
import { Preparedness } from "../../types";
import { PREPAREDNESS_COLORS, RING_COLORS } from "../../constants/colors";

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
      const headingElement = screen.getByRole("heading", {
        name: "Rings (Likelihood)",
      });
      if (!headingElement.parentElement) {
        throw new Error(
          "Parent element for 'Rings (Likelihood)' heading not found.",
        );
      }
      const likelihoodSection = headingElement.parentElement;

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

    it("should set aria-expanded to true when expanded and false when collapsed", () => {
      render(<Legend />);

      const button = screen.getByRole("button", { name: "Legend" });

      expect(button).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Preparedness color indicators", () => {
    beforeEach(() => {
      render(<Legend />);
    });

    it("should apply the high preparedness color to HighlyPrepared", () => {
      const text = screen.getByText(Preparedness.HighlyPrepared);
      const indicator = text.previousElementSibling as HTMLElement;
      expect(indicator).toHaveStyle({
        backgroundColor: PREPAREDNESS_COLORS.high,
      });
    });

    it("should apply the moderate preparedness color to ModeratelyPrepared", () => {
      const text = screen.getByText(Preparedness.ModeratelyPrepared);
      const indicator = text.previousElementSibling as HTMLElement;
      expect(indicator).toHaveStyle({
        backgroundColor: PREPAREDNESS_COLORS.moderate,
      });
    });

    it("should apply the low preparedness color to InadequatelyPrepared", () => {
      const text = screen.getByText(Preparedness.InadequatelyPrepared);
      const indicator = text.previousElementSibling as HTMLElement;
      expect(indicator).toHaveStyle({
        backgroundColor: PREPAREDNESS_COLORS.low,
      });
    });
  });

  describe("Relevance size indicators", () => {
    let relevanceSection: HTMLElement;

    beforeEach(() => {
      render(<Legend />);
      const heading = screen.getByRole("heading", { name: "Size (Relevance)" });
      relevanceSection = heading.closest("div") as HTMLElement;
    });

    it("should render the High relevance indicator with the largest size", () => {
      const text = within(relevanceSection).getByText("High");
      const indicator = text.previousElementSibling as HTMLElement;
      expect(indicator).toHaveClass("w-[14px]", "h-[14px]");
    });

    it("should render the Moderate relevance indicator with the medium size", () => {
      const text = within(relevanceSection).getByText("Moderate");
      const indicator = text.previousElementSibling as HTMLElement;
      expect(indicator).toHaveClass("w-[10px]", "h-[10px]");
    });

    it("should render the Low relevance indicator with the smallest size", () => {
      const text = within(relevanceSection).getByText("Low");
      const indicator = text.previousElementSibling as HTMLElement;
      expect(indicator).toHaveClass("w-[7px]", "h-[7px]");
    });
  });
});
