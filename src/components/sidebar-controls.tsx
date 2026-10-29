"use client";

import { SIDEBAR_STORAGE_KEY } from "./preferences-script";

// Matches the sidebar's width transition (duration-300).
const EXPAND_MS = 300;

// The collapsed state lives on <html data-sidebar>, so all styling is plain
// CSS (the `collapsed:` variant) and no React state is needed. Expanding goes
// through "expanding": full width, collapsed layout, until the width animation
// ends; `onExpanded` runs once the labels are shown.
export function setSidebarCollapsed(collapsed: boolean, onExpanded?: () => void) {
  const root = document.documentElement;
  const state = collapsed ? "collapsed" : "expanded";
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, state);
  } catch {}

  if (collapsed || root.dataset.sidebar !== "collapsed") {
    root.dataset.sidebar = state;
    onExpanded?.();
    return;
  }
  root.dataset.sidebar = "expanding";
  setTimeout(() => {
    // Unless it was collapsed again in the meantime.
    if (root.dataset.sidebar !== "expanding") return;
    root.dataset.sidebar = "expanded";
    onExpanded?.();
  }, EXPAND_MS);
}

function toggleSidebar() {
  setSidebarCollapsed(document.documentElement.dataset.sidebar !== "collapsed");
}

// Sidebar icon with a filled left panel, like the reference design.
function SidebarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-6"
    >
      <rect x="3" y="4" width="18" height="16" rx="4" />
      <rect x="6.5" y="7.5" width="4.5" height="9" rx="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SidebarToggle() {
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label="Toggle Sidebar"
      title="Toggle Sidebar"
      className="ml-auto flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-icon transition-colors hover:bg-hover collapsed:transition-none collapsed:hover:transition-opacity collapsed:absolute collapsed:top-0 collapsed:left-1.5 collapsed:bg-background collapsed:opacity-0 collapsed:hover:bg-background collapsed:hover:opacity-100"
    >
      <SidebarIcon />
    </button>
  );
}

// Covers the search field while collapsed: expands the sidebar and focuses it.
export function SearchExpandButton({ inputId }: { inputId: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        setSidebarCollapsed(false, () => document.getElementById(inputId)?.focus());
      }}
      aria-label="Search Player"
      title="Search Player"
      className="absolute inset-0 hidden cursor-pointer rounded-[10px] collapsed:block"
    />
  );
}
