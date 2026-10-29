"use client";

import { THEME_STORAGE_KEY } from "./preferences-script";

export type Theme = "dark" | "light";

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

// Miniature of the TickLog layout in the given theme's colors.
function ThemePreview({ theme }: { theme: Theme }) {
  const c =
    theme === "dark"
      ? { bg: "bg-black border-[#262626]", line: "border-[#1a1a1a]", bar: "bg-[#1c1c1f]", soft: "bg-[#111113]" }
      : { bg: "bg-white border-[#e8e8e8]", line: "border-[#f0f0f0]", bar: "bg-[#22232a]", soft: "bg-[#f1f1f2]" };
  return (
    <div aria-hidden="true" className={`flex h-28 overflow-hidden rounded-[10px] border ${c.bg}`}>
      <div className={`flex w-[38%] flex-col gap-1.5 border-r p-2.5 ${c.line}`}>
        <div className={`h-2 w-10 rounded-full ${c.soft}`} />
        <div className={`mt-1 h-3.5 rounded-[4px] ${c.soft}`} />
        <div className={`h-3.5 rounded-[4px] ${c.bar}`} />
        <div className={`h-2 w-12 rounded-full ${c.soft}`} />
        <div className={`h-2 w-9 rounded-full ${c.soft}`} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className={`h-2.5 w-16 rounded-full ${c.soft}`} />
        <div className={`mt-1 h-12 rounded-[6px] ${c.soft}`} />
      </div>
    </div>
  );
}

// Dark / Light cards. The selected one is styled from <html data-theme> via
// the `dark:` / `light:` variants, so no React state is needed.
const themeCard =
  "group flex cursor-pointer flex-col gap-3 rounded-[12px] border border-search-border p-2 pb-3 text-left transition-colors hover:border-icon";

export function ThemePicker() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label="Dark theme"
        className={`${themeCard} dark:border-heading dark:hover:border-heading`}
      >
        <ThemePreview theme="dark" />
        <span className="flex items-center gap-2 px-1.5 text-[14px] font-medium text-nav-text dark:text-heading">
          {/* Lucide "moon" */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
          Dark
          <Check className="ml-auto hidden dark:block" />
        </span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label="Light theme"
        className={`${themeCard} light:border-heading light:hover:border-heading`}
      >
        <ThemePreview theme="light" />
        <span className="flex items-center gap-2 px-1.5 text-[14px] font-medium text-nav-text light:text-heading">
          {/* Lucide "sun" */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
          Light
          <Check className="ml-auto hidden light:block" />
        </span>
      </button>
    </div>
  );
}

// Lucide "circle-check" (filled), marks the selected theme.
function Check({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`size-[18px] text-heading ${className}`}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="var(--background)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
