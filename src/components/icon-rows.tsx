"use client";

import { useRef, useState } from "react";
import { ScrollArea } from "./scroll-area";

export type IconItem = { key: string; label: string; icon: React.ReactNode };

// Icons in rows that scroll once there are more than fit `className`'s
// height. The name shows above the hovered icon; it's drawn outside the
// scroller so it never gets clipped. `onHover` / `onPick` make the icons
// interactive (with the item's key, null when the pointer leaves).
export function IconRows({
  items,
  className,
  gap,
  onHover,
  onPick,
}: {
  items: IconItem[];
  className: string;
  gap: string;
  onHover?: (key: string | null) => void;
  onPick?: (key: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{
    label: string;
    x: number;
    y: number;
  } | null>(null);

  function show(label: string, el: HTMLElement) {
    const box = root.current?.getBoundingClientRect();
    if (!box) return;
    const r = el.getBoundingClientRect();
    setHover({ label, x: r.left - box.left + r.width / 2, y: r.top - box.top });
  }

  return (
    <div
      ref={root}
      className="relative"
      onPointerLeave={() => {
        setHover(null);
        onHover?.(null);
      }}
    >
      <ScrollArea
        className={className}
        inset={2}
        onScroll={() => setHover(null)}
      >
        <div className={`flex flex-wrap pr-4 ${gap}`}>
          {items.map((item) => (
            <span
              key={item.key}
              onPointerEnter={(e) => {
                show(item.label, e.currentTarget);
                onHover?.(item.key);
              }}
              onClick={onPick && (() => onPick(item.key))}
              className={onPick ? "cursor-pointer" : undefined}
            >
              {item.icon}
            </span>
          ))}
        </div>
      </ScrollArea>
      {hover && (
        <span
          role="tooltip"
          className="pointer-events-none absolute z-10 mb-1.5 -translate-x-1/2 -translate-y-full rounded-[6px] border border-search-border bg-background px-2 py-1 text-[12px] whitespace-nowrap text-heading"
          style={{ left: hover.x, top: hover.y - 6 }}
        >
          {hover.label}
        </span>
      )}
    </div>
  );
}
