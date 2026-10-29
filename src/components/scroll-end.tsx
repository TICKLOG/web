"use client";

import { useEffect, useRef } from "react";

// Horizontal scroller that starts scrolled to its right end (the newest weeks
// when the heatmap doesn't fit).
export function ScrollEnd({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    // Hidden tooltips add a few pixels of scroll width; only jump when the
    // content itself doesn't fit.
    if (el && el.scrollWidth - el.clientWidth > 80) el.scrollLeft = el.scrollWidth;
  }, []);
  return (
    <div ref={ref} className={`overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      {children}
    </div>
  );
}
