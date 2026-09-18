"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

/** Must match the key read by the blocking script in layout.tsx. */
const STORAGE_KEY = "theme";

/** Fired whenever the theme changes, so every mounted control stays in sync. */
export const THEME_CHANGE_EVENT = "theme:change";

export function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* Storage can be unavailable (private mode). The theme still applies. */
  }
  window.dispatchEvent(new CustomEvent<Theme>(THEME_CHANGE_EVENT, { detail: theme }));
}

/** Flips the theme and returns the one now in effect. */
export function toggleTheme(): Theme {
  const next: Theme = readTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="3.1" />
      <path d="M8 1.2v1.6M8 13.2v1.6M14.8 8h-1.6M2.8 8H1.2M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1M12.8 12.8l-1.1-1.1M4.3 4.3L3.2 3.2" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.4 9.6A5.8 5.8 0 0 1 6.4 2.6a5.8 5.8 0 1 0 7 7Z" />
    </svg>
  );
}

/**
 * Icon-only theme switch. The button box is rendered at a fixed size on the
 * server so mounting the icon cannot shift layout.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setMounted(true);
    setTheme(readTheme());
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<Theme>).detail;
      setTheme(detail ?? readTheme());
    };
    window.addEventListener(THEME_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(toggleTheme())}
      aria-label={mounted ? `Switch to ${next} theme` : "Switch theme"}
      title={mounted ? `Switch to ${next} theme` : "Switch theme"}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-line text-muted transition-colors hover:border-line-bright hover:text-bone ${className}`}
    >
      <span className="block h-[15px] w-[15px]">
        {mounted ? theme === "dark" ? <MoonIcon /> : <SunIcon /> : null}
      </span>
    </button>
  );
}
