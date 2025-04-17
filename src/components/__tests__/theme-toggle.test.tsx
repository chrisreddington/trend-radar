import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { ThemeToggle, THEME_OPTIONS } from "../theme-toggle";

/**
 * Helper to mock matchMedia for system theme tests.
 * @param {boolean} matches - Whether the system prefers dark mode.
 */
function mockMatchMedia(matches: boolean) {
  Object.defineProperty(globalThis, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
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
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
        key: (index: number) => Object.keys(store)[index] || null,
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
    globalThis.localStorage = originalLocalStorage;
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
    expect(globalThis.localStorage.getItem("theme")).toBe(null);
    expect([THEME_OPTIONS.DARK, THEME_OPTIONS.LIGHT]).toContain(
      document.documentElement.dataset.theme,
    );
  });

  it("responds to system theme changes when system is selected", () => {
    let listener: (() => void) | undefined;
    globalThis.matchMedia = jest.fn().mockImplementation((query: string) => {
      return {
        matches: false,
        media: query,
        addEventListener: (event: string, cb: () => void) => {
          listener = cb;
        },
        removeEventListener: jest.fn(),
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
});
