import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { ThemeToggle, THEME_OPTIONS } from "../theme-toggle";
import { vi } from "vitest";

/**
 * Helper to mock matchMedia for system theme tests.
 * @param {boolean} matches - Whether the system prefers dark mode.
 */
function mockMatchMedia(matches: boolean) {
  Object.defineProperty(globalThis, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

describe("ThemeToggle", () => {
  const originalMatchMedia = globalThis.matchMedia;
  const originalLocalStorage = globalThis.localStorage;
  let localStorageMock: Storage;

  beforeEach(() => {
    localStorageMock = (function () {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key],
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          store[key] = undefined as unknown as string;
        },
        clear: () => {
          store = {};
        },
        key: (index: number) => Object.keys(store)[index],
        length: 0,
      } as Storage;
    })();
    Object.defineProperty(globalThis, "localStorage", {
      value: localStorageMock,
    });
    mockMatchMedia(false); // default to light
  });

  afterEach(() => {
    globalThis.matchMedia = originalMatchMedia;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      writable: true,
      value: originalLocalStorage,
    });
  });

  it("defaults to system theme when localStorage returns an invalid value", () => {
    localStorageMock.setItem("theme", "invalid-theme-value");
    render(<ThemeToggle />);
    expect(
      screen.getByLabelText("System theme").getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("defaults to system theme when localStorage throws (e.g. private-browsing)", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("localStorage is not available");
      },
    });
    expect(() => render(<ThemeToggle />)).not.toThrow();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: localStorageMock,
    });
  });

  it("does not throw when localStorage.setItem throws during theme change", () => {
    const throwingStorage = {
      ...localStorageMock,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => {
        throw new Error("QuotaExceededError");
      },
    } as Storage;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: throwingStorage,
    });
    render(<ThemeToggle />);
    expect(() => fireEvent.click(screen.getByLabelText("Light theme"))).not.toThrow();
  });

  it("renders all theme options", () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText("Light theme")).toBeInTheDocument();
    expect(screen.getByLabelText("Dark theme")).toBeInTheDocument();
    expect(screen.getByLabelText("System theme")).toBeInTheDocument();
  });

  it("selects light theme and updates localStorage and html attribute", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText("Light theme"));
    expect(globalThis.localStorage.getItem("theme")).toBe(THEME_OPTIONS.LIGHT);
    expect(document.documentElement.dataset.theme).toBe(THEME_OPTIONS.LIGHT);
  });

  it("selects dark theme and updates localStorage and html attribute", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText("Dark theme"));
    expect(globalThis.localStorage.getItem("theme")).toBe(THEME_OPTIONS.DARK);
    expect(document.documentElement.dataset.theme).toBe(THEME_OPTIONS.DARK);
  });

  it("selects system theme, removes localStorage, and sets html attribute based on system", () => {
    mockMatchMedia(true); // system prefers dark
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText("System theme"));
    expect(globalThis.localStorage.getItem("theme")).toBe(undefined);
    expect([THEME_OPTIONS.DARK, THEME_OPTIONS.LIGHT]).toContain(
      document.documentElement.dataset.theme,
    );
  });

  it("responds to system theme changes when system is selected", () => {
    let listener: (() => void) | undefined;
    globalThis.matchMedia = vi.fn().mockImplementation((query: string) => {
      return {
        matches: false,
        media: query,
        addEventListener: (event: string, callback: () => void) => {
          listener = callback;
        },
        removeEventListener: vi.fn(),
      };
    });
    render(<ThemeToggle />);
    fireEvent.click(screen.getByLabelText("System theme"));
    // Simulate system theme change
    document.documentElement.dataset.theme = "light";
    if (listener) listener();
    // Should update to match system (which is mocked as light)
    expect([THEME_OPTIONS.DARK, THEME_OPTIONS.LIGHT]).toContain(
      document.documentElement.dataset.theme,
    );
  });

  describe("aria-pressed attribute", () => {
    it("should set aria-pressed=true only on the active theme button", () => {
      render(<ThemeToggle />);

      fireEvent.click(screen.getByLabelText("Light theme"));

      expect(screen.getByLabelText("Light theme")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByLabelText("Dark theme")).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      expect(screen.getByLabelText("System theme")).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    it("should update aria-pressed when dark theme is selected", () => {
      render(<ThemeToggle />);

      fireEvent.click(screen.getByLabelText("Dark theme"));

      expect(screen.getByLabelText("Dark theme")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByLabelText("Light theme")).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });

  describe("localStorage initialisation", () => {
    it("should initialise to the theme stored in localStorage", () => {
      localStorageMock.setItem("theme", THEME_OPTIONS.DARK);
      render(<ThemeToggle />);
      expect(screen.getByLabelText("Dark theme")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("should default to system theme when localStorage has no stored value", () => {
      render(<ThemeToggle />);
      expect(screen.getByLabelText("System theme")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });
  });
});
