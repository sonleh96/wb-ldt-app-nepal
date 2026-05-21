"use client";

import { useSyncExternalStore } from "react";

import { useTheme } from "@/components/theme/theme-provider";

function useHasHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const hasHydrated = useHasHydrated();
  const label = hasHydrated
    ? isDark
      ? "Switch to light mode"
      : "Switch to dark mode"
    : "Toggle theme";
  const statusLabel = hasHydrated ? (isDark ? "Dark" : "Light") : "Theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 text-[var(--foreground)] transition-colors hover:bg-[var(--surface-strong)]"
      aria-label={label}
      title={label}
      aria-pressed={hasHydrated ? isDark : undefined}
    >
      {hasHydrated && isDark ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M12 3.75V5.25M12 18.75V20.25M5.46 5.46L6.52 6.52M17.48 17.48L18.54 18.54M3.75 12H5.25M18.75 12H20.25M5.46 18.54L6.52 17.48M17.48 6.52L18.54 5.46M15.75 12A3.75 3.75 0 1 1 8.25 12A3.75 3.75 0 0 1 15.75 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3C11.14 3.51 11.1 4.03 11.1 4.56C11.1 9.35 14.98 13.23 19.77 13.23C20.3 13.23 20.82 13.19 21.33 13.12C21.11 13.01 21 12.91 21 12.79Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span className="text-sm font-medium">{statusLabel}</span>
    </button>
  );
}
