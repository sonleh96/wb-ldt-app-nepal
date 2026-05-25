"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";

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
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={toggleTheme}
      className="h-10 rounded-full border-[var(--border-soft)] bg-[var(--surface)] px-3 text-[var(--foreground)] hover:bg-[var(--surface-strong)]"
      aria-label={label}
      title={label}
      aria-pressed={hasHydrated ? isDark : undefined}
    >
      {hasHydrated && isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      <span className="hidden text-sm font-medium xl:inline">{statusLabel}</span>
    </Button>
  );
}
