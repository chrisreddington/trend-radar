import React from "react";
import { render, screen } from "@testing-library/react";

import { ViewSourceOnGitHub } from "../view-github-source";

describe("ViewSourceOnGitHub", () => {
  const repoUrl = "https://github.com/test/repo";

  test("renders link with correct attributes and default aria-label", () => {
    render(<ViewSourceOnGitHub repoUrl={repoUrl} />);
    const link = screen.getByRole("link", { name: /view source on github/i });
    expect(link).toHaveAttribute("href", repoUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("renders light and dark mode images with correct src and classes", () => {
    render(<ViewSourceOnGitHub repoUrl={repoUrl} />);
    // Select images by alt text now that alt is set on Image components
    const images = screen.getAllByAltText(/GitHub logo/i);
    const [lightImg, darkImg] = images;
    expect(lightImg).toHaveAttribute(
      "src",
      expect.stringContaining("github-mark.png"),
    );
    expect(lightImg).toHaveClass("w-6", "h-6", "dark:hidden");
    expect(darkImg).toHaveAttribute(
      "src",
      expect.stringContaining("github-mark-white.png"),
    );
    expect(darkImg).toHaveClass("w-6", "h-6", "hidden", "dark:block");
  });

  test("renders label as part of the link", () => {
    render(<ViewSourceOnGitHub repoUrl={repoUrl} />);
    const link = screen.getByRole("link", { name: /view source on github/i });
    expect(link).toHaveTextContent(/view source/i);
  });
});
