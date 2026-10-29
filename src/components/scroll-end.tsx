"use client";

import { useEffect, useRef } from "react";

// Horizontal scroller that starts scrolled to its right end (the newest weeks
// when the heatmap doesn't fit).
export function ScrollEnd({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const last = el?.lastElementChild as HTMLElement | null | undefined;
    if (!el || !last) return;
    // Scroll to the right edge of the content itself; hidden tooltips would
    // make scrollWidth a little wider than that.
    const end = last.offsetLeft + last.offsetWidth - el.offsetLeft;
    if (end > el.clientWidth) el.scrollLeft = end - el.clientWidth;
  }, []);
  return (
    <div ref={ref} className={`overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      {children}
    </div>
  );
}
