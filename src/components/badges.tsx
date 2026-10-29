import Image from "next/image";
import type { Badge } from "@/lib/badges";
import { IconRows } from "./icon-rows";

// The player's badges in a box below the capes; the name shows on hover.
// Scrolls after one row.
export function Badges({ badges, className = "" }: { badges: Badge[]; className?: string }) {
  return (
    <div className={`w-80 rounded-[12px] border border-search-border bg-search p-4 ${className}`}>
      <p className="text-[12px] font-semibold tracking-wider text-search-text uppercase">Badges</p>
      {badges.length === 0 ? (
        <p className="mt-3 text-[14px] text-search-text">No badges yet.</p>
      ) : (
        <div className="mt-3">
          <IconRows
            // One row of 36px badges.
            className="max-h-9"
            gap="gap-2"
            items={badges.map((b) => ({
              key: b.id,
              label: b.label,
              icon: (
                <span className="flex size-9 items-center justify-center">
                  <Image
                    src={b.image}
                    alt={b.label}
                    width={32}
                    height={32}
                    unoptimized
                    className="size-8 max-w-none [image-rendering:pixelated]"
                  />
                </span>
              ),
            }))}
          />
        </div>
      )}
    </div>
  );
}
