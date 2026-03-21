"use client";
import { Component, ErrorInfo } from "react";

interface ErrorBoundaryProperties {
  children: React.ReactNode;
  /** Optional custom fallback UI. Receives the error and a reset function. */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | undefined;
  retryAfterError: boolean;
}

const DEFAULT_FALLBACK_HEADING = "Something went wrong";
const DEFAULT_FALLBACK_DESCRIPTION =
  "An unexpected error occurred. Please try again.";
const RETRY_BUTTON_LABEL = "Try again";

/**
 * Catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProperties,
  ErrorBoundaryState
> {
  constructor(properties: ErrorBoundaryProperties) {
    super(properties);
    this.state = { hasError: false, error: undefined, retryAfterError: false };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  componentDidUpdate(previousProperties: ErrorBoundaryProperties): void {
    if (
      this.state.hasError &&
      this.state.retryAfterError &&
      previousProperties.children !== this.props.children
    ) {
      this.setState({ hasError: false, error: undefined, retryAfterError: false });
    }
  }

  reset(): void {
    this.setState({ hasError: false, error: undefined, retryAfterError: true });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-4 p-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-center"
        >
          <p className="text-lg font-semibold text-red-700 dark:text-red-300">
            {DEFAULT_FALLBACK_HEADING}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {DEFAULT_FALLBACK_DESCRIPTION}
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {RETRY_BUTTON_LABEL}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
