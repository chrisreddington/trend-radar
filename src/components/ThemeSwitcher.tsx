"use client";
import { useThemeStore } from '../store/useThemeStore';

export const ThemeSwitcher = () => {
  const { mode, setMode } = useThemeStore();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setMode('light')}
        className={`p-2 rounded-md ${
          mode === 'light' 
            ? 'bg-highlight text-white' 
            : 'text-text-primary hover:bg-ring-color'
        }`}
        aria-label="Light mode"
        title="Light mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>
      <button
        onClick={() => setMode('dark')}
        className={`p-2 rounded-md ${
          mode === 'dark' 
            ? 'bg-highlight text-white' 
            : 'text-text-primary hover:bg-ring-color'
        }`}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>
      <button
        onClick={() => setMode('system')}
        className={`p-2 rounded-md ${
          mode === 'system' 
            ? 'bg-highlight text-white' 
            : 'text-text-primary hover:bg-ring-color'
        }`}
        aria-label="System theme"
        title="System theme"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      </button>
    </div>
  );
};