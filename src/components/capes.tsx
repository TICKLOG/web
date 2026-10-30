"use client";

import Image from "next/image";
import type { Cape } from "@/lib/capes";
import { useCapePreview } from "./cape-preview";
import { IconRows } from "./icon-rows";

// The player's capes above the badges, side by side like on NameMC; the name
// shows on hover. Hovering or clicking a cape previews it on the 3D skin.
// Scrolls after one row.
export function Capes({
  capes,
  className = "",
}: {
  capes: Cape[];
  className?: string;
}) {
  const preview = useCapePreview();
  return (
    <div
      className={`w-full rounded-[12px] border border-search-border bg-search p-4 lg:w-80 ${className}`}
    >
      <p className="text-[12px] font-semibold tracking-wider text-search-text uppercase">
        Capes
      </p>
      {capes.length === 0 ? (
        <p className="mt-3 text-[14px] text-search-text">No capes yet.</p>
      ) : (
        <div className="mt-3">
          <IconRows
            // One row of 48px capes.
            className="max-h-12"
            gap="gap-3"
            onHover={preview?.hover}
            onPick={preview?.pick}
            items={capes.map((c) => ({
              key: c.hash,
              label: c.alias ?? "Cape",
              icon: (
                <Image
                  // `v` busts caches when the rendering changes.
                  src={`/capes/${c.hash}.png?v=2`}
                  alt={c.alias ?? "Cape"}
                  width={30}
                  height={48}
                  unoptimized
                  // Exactly 3× the 10×16 cape front, so every pixel stays square.
                  className="h-12 w-[30px] max-w-none rounded-[3px] [image-rendering:pixelated]"
                />
              ),
            }))}
          />
        </div>
      )}
    </div>
  );
}
