"use client";

import { useState } from "react";
import { Icon } from "./icon";

// Copies `text`; the icon turns into a green check for a moment.
export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy"
      title="Copy"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        });
      }}
      className="cursor-pointer rounded p-1 text-search-text transition-colors hover:text-heading"
    >
      {done ? (
        <Icon className="size-3.5 text-emerald-500">
          <path d="M20 6 9 17l-5-5" />
        </Icon>
      ) : (
        <Icon className="size-3.5">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </Icon>
      )}
    </button>
  );
}
