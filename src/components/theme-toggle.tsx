"use client";
import React from "react";

/**
 * Theme options for the theme toggle.
 * @enum {string}
 */
export const THEME_OPTIONS = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

/**
 * Type for allowed theme options.
 * @typedef {"light" | "dark" | "system"} ThemeOption
 */
export type ThemeOption = (typeof THEME_OPTIONS)[keyof typeof THEME_OPTIONS];

/**
 * LocalStorage key for theme preference.
 * @type {string}
 */
const THEME_STORAGE_KEY = "theme";

/**
 * Returns the user's OS-level color scheme preference.
 * @returns {ThemeOption}
 */
function getSystemTheme(): ThemeOption {
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
    ? THEME_OPTIONS.DARK
    : THEME_OPTIONS.LIGHT;
}

/**
 * Applies the theme to the <html> element's data-theme attribute.
 * @param {ThemeOption} theme - The theme to apply (light, dark, or system)
 */
function applyTheme(theme: ThemeOption): void {
  const html = document.documentElement;
  let resolvedTheme = theme;
  if (theme === THEME_OPTIONS.SYSTEM) {
    resolvedTheme = getSystemTheme();
  }
  html.dataset.theme = resolvedTheme;
}

/**
 * SVG icon for the sun (light theme).
 */
function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41" />
    </svg>
  );
}

/**
 * SVG icon for the moon (dark theme).
 */
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

/**
 * SVG icon for the cog (system theme).
 */
function CogIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 9 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/**
 * ThemeToggle component for selecting light, dark, or system theme.
 * @returns {JSX.Element}
 */
export function ThemeToggle() {
  const [theme, setTheme] = React.useState<ThemeOption>(() => {
    if (globalThis.window === undefined) return THEME_OPTIONS.SYSTEM;
    return (
      (globalThis.localStorage.getItem(THEME_STORAGE_KEY) as ThemeOption) ||
      THEME_OPTIONS.SYSTEM
    );
  });

  // Listen for system theme changes if "system" is selected
  React.useEffect(() => {
    if (theme !== THEME_OPTIONS.SYSTEM) return;
    const handler = () => applyTheme(THEME_OPTIONS.SYSTEM);
    const mql = globalThis.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  // Apply theme on mount and whenever theme changes
  React.useEffect(() => {
    applyTheme(theme);
    if (theme === THEME_OPTIONS.SYSTEM) {
      globalThis.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      globalThis.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  /**
   * Handles theme selection changes.
   * @param {ThemeOption} selectedTheme - The selected theme option.
   */
  function handleThemeSelect(selectedTheme: ThemeOption): void {
    setTheme(selectedTheme);
  }

  const themeOptions = [
    {
      value: THEME_OPTIONS.LIGHT,
      label: "Light",
      icon: SunIcon,
    },
    {
      value: THEME_OPTIONS.DARK,
      label: "Dark",
      icon: MoonIcon,
    },
    {
      value: THEME_OPTIONS.SYSTEM,
      label: "System",
      icon: CogIcon,
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-center items-center gap-4">
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleThemeSelect(value)}
              className={`flex flex-col items-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors text-sm font-medium
                ${
                  theme === value
                    ? "bg-blue-600 text-white dark:bg-blue-700"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                }
              `}
              aria-pressed={theme === value}
              aria-label={label + " theme"}
            >
              <Icon className="w-6 h-6 mb-1" />
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">Theme</span>
      </div>
    </div>
  );
}
