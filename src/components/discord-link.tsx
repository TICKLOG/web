"use client";

import { useState } from "react";
import { DiscordIcon } from "./discord-icon";

// A Discord username has no profile URL, so clicking copies it; the title
// says "Copied" for a moment.
export function DiscordLink({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      title={done ? "Copied" : `Discord: ${name} (click to copy)`}
      aria-label={`Discord: ${name}`}
      onClick={() =>
        navigator.clipboard.writeText(name).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        })
      }
      className={`relative ${className}`}
    >
      <DiscordIcon className="size-4 text-[#5865f2]" />
      {done && (
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 rounded-[6px] border border-search-border bg-background px-2 py-1 text-[12px] whitespace-nowrap text-heading shadow-lg">
          Copied
        </span>
      )}
    </button>
  );
}
