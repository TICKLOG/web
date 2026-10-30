"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SearchExpandButton } from "./sidebar-controls";

// Lucide "search" icon.
function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5 shrink-0"
    >
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  );
}

const FLASH_MS = 800;

// "Search Player": on Enter, opens the player page and checks the name with
// Mojang. The border flashes green, or red if there is no such player.
export function SearchPlayer() {
  const router = useRouter();
  const [flash, setFlash] = useState<"found" | "missing" | null>(null);
  const flashTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  function showFlash(result: "found" | "missing") {
    clearTimeout(flashTimeout.current);
    setFlash(result);
    flashTimeout.current = setTimeout(() => setFlash(null), FLASH_MS);
  }

  return (
    <form
      role="search"
      className="mt-8 max-md:mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        const name = new FormData(e.currentTarget).get("player")?.toString().trim();
        if (!name) return;
        if (!/^[A-Za-z0-9_]{1,16}$/.test(name)) return showFlash("missing");
        // Opens the page right away, so its loading spinner shows while the
        // name is checked; the check only colors the border.
        router.push(`/@${name.toLowerCase()}`);
        fetch(`/api/player?name=${name}`)
          .then((r) => r.json())
          .then(({ found }) => showFlash(found ? "found" : "missing"))
          .catch(() => {});
      }}
    >
      <label
        className={`relative flex h-10 cursor-text items-center gap-2.5 rounded-[10px] border bg-search px-[11px] text-search-text transition-colors duration-200 ${
          flash === "found" ? "border-green-500" : flash === "missing" ? "border-red-500" : "border-search-border"
        }`}
      >
        <SearchIcon />
        <SearchExpandButton inputId="sidebar-search" />
        <input
          id="sidebar-search"
          name="player"
          type="search"
          placeholder="Search Player"
          aria-label="Search Player"
          autoComplete="off"
          spellCheck={false}
          maxLength={16}
          className="w-full min-w-0 bg-transparent text-[15px] text-heading max-md:text-base outline-none placeholder:text-search-text collapsed:hidden [&::-webkit-search-cancel-button]:hidden"
        />
      </label>
    </form>
  );
}
