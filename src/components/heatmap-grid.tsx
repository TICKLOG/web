"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/format";
import { cellStyle } from "@/lib/heat";

export type HeatCell = {
  key: string;
  label: string;
  seconds: number;
  // 0 = empty, 1–4 = activity level.
  level: number;
  future: boolean;
};

// The 52×7 grid. Hover shows the tooltip on desktop, a tap toggles it on
// phones.
export function HeatmapGrid({ cells, accent }: { cells: HeatCell[]; accent: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const weeks = cells.length / 7;

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
      {cells.map((c, i) => {
        // The scroller clips its edges: top rows get the tooltip below the
        // cell, the outer weeks get it anchored inwards.
        const below = i % 7 < 3;
        const right = Math.floor(i / 7) >= weeks - 5;
        const left = Math.floor(i / 7) < 5;
        const shown = open === c.key;
        return (
          <span
            key={c.key}
            onPointerDown={(e) => {
              if (c.future) return;
              e.stopPropagation();
              setOpen(shown ? null : c.key);
            }}
            className={`group relative size-[11px] rounded-[2px] ${c.future ? "pointer-events-none opacity-0" : "bg-search-border"}`}
          >
            {!c.future && c.level > 0 && (
              <span aria-hidden="true" className="absolute inset-0 rounded-[2px]" style={cellStyle(accent, c.level)} />
            )}
            <span
              role="tooltip"
              className={`pointer-events-none absolute z-10 rounded-[6px] border border-search-border bg-background px-2 py-1 text-[12px] whitespace-nowrap text-search-text transition-opacity group-hover:opacity-100 ${shown ? "opacity-100" : "opacity-0"} ${below ? "top-full mt-1.5" : "bottom-full mb-1.5"} ${right ? "right-0" : left ? "left-0" : "left-1/2 -translate-x-1/2"}`}
            >
              {c.seconds > 0 ? (
                <>
                  <span className="font-semibold text-heading">{formatDuration(c.seconds)}</span> on {c.label}
                </>
              ) : (
                `No playtime on ${c.label}`
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
}
