import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ErrorBoundary } from "../error-boundary";

/** A component that throws on first render when `shouldThrow` is true. */
const ThrowingChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test render error");
  }
  return <div>Healthy content</div>;
};

describe("ErrorBoundary", () => {
  const user = userEvent.setup();
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Suppress React's error boundary noise in test output
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    vi.clearAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Healthy content")).toBeInTheDocument();
  });

  it("renders the default fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("An unexpected error occurred. Please try again."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });

  it("logs the error via console.error when a child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(console.error).toHaveBeenCalledWith(
      "ErrorBoundary caught an error:",
      expect.any(Error),
      expect.anything(),
    );
  });

  it("renders a custom fallback when the fallback prop is provided", () => {
    const customFallback = (error: Error) => (
      <div role="alert">Custom: {error.message}</div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Custom: Test render error",
    );
  });

  it("resets to healthy state when the retry button is clicked", async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Fallback is shown
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Click retry — resets error boundary state
    await user.click(screen.getByRole("button", { name: "Try again" }));

    // Re-render with a non-throwing child to confirm children render again
    rerender(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Healthy content")).toBeInTheDocument();
  });

  it("does not auto-reset when children change without the retry button being clicked", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Re-render with a non-throwing child but without clicking retry first
    rerender(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    );

    // Alert should still be visible because retry was never requested
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("keeps fallback when retry is clicked but children still throw", async () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Click retry — same throwing child re-renders and error is re-caught
    await user.click(screen.getByRole("button", { name: "Try again" }));

    // Fallback must still be visible because children have not changed
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("passes the reset function to a custom fallback", async () => {
    const resetSpy = vi.fn();
    const customFallback = (_error: Error, reset: () => void) => (
      <button
        type="button"
        onClick={() => {
          resetSpy();
          reset();
        }}
      >
        Custom reset
      </button>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    await user.click(screen.getByRole("button", { name: "Custom reset" }));
    expect(resetSpy).toHaveBeenCalledTimes(1);
  });
});
