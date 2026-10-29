"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

// Vertical scroller with a slim custom scrollbar floating inside it, shown
// while scrolling or hovering (like the leaderboard). `className` sets the
// scroller's size (`rootClassName` the wrapper's, e.g. to fill a flex column);
// `resetKey` scrolls back to the top when it changes.
export function ScrollArea({
  children,
  className = "",
  rootClassName = "",
  inset = 8,
  resetKey,
  onScroll,
}: {
  children: React.ReactNode;
  className?: string;
  rootClassName?: string;
  inset?: number;
  resetKey?: string;
  onScroll?: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ top: 0, height: 0, show: false });
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{ y: number; top: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  function measure(show = false) {
    const el = box.current;
    if (!el) return;
    const track = el.clientHeight - inset * 2;
    const ratio = el.clientHeight / el.scrollHeight;
    if (ratio >= 1) {
      setThumb({ top: 0, height: 0, show: false });
      return;
    }
    const height = Math.max(Math.min(32, track / 2), Math.round(track * ratio));
    const top =
      inset +
      Math.round(
        (el.scrollTop / (el.scrollHeight - el.clientHeight)) * (track - height),
      );
    setThumb((t) => ({ top, height, show: show || t.show }));
    if (show) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(
        () => setThumb((t) => ({ ...t, show: false })),
        900,
      );
    }
  }

  const remeasure = useEffectEvent(() => measure());

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.scrollTo({ top: 0 });
    remeasure();
    const ro = new ResizeObserver(() => remeasure());
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [resetKey]);

  function startDrag(e: React.PointerEvent<HTMLSpanElement>) {
    const el = box.current;
    if (!el) return;
    drag.current = { y: e.clientY, top: el.scrollTop };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function moveDrag(e: React.PointerEvent<HTMLSpanElement>) {
    const el = box.current;
    if (!el || !drag.current) return;
    const track = el.clientHeight - inset * 2 - thumb.height;
    const perPx = (el.scrollHeight - el.clientHeight) / Math.max(1, track);
    el.scrollTop = drag.current.top + (e.clientY - drag.current.y) * perPx;
  }

  function endDrag() {
    drag.current = null;
    setDragging(false);
    measure(true);
  }

  // Click on the track: jump so the thumb centers on the pointer.
  function jump(e: React.MouseEvent<HTMLDivElement>) {
    const el = box.current;
    if (!el || e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const track = el.clientHeight - inset * 2 - thumb.height;
    const y = e.clientY - rect.top - inset - thumb.height / 2;
    el.scrollTop =
      (Math.min(Math.max(y, 0), track) / Math.max(1, track)) *
      (el.scrollHeight - el.clientHeight);
  }

  return (
    <div className={`group/scroll relative ${rootClassName}`}>
      <div
        ref={box}
        onScroll={() => {
          measure(true);
          onScroll?.();
        }}
        className={`overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      >
        {children}
      </div>
      {thumb.height > 0 && (
        <div
          aria-hidden="true"
          onClick={jump}
          className={`absolute inset-y-0 right-0 w-4 cursor-pointer transition-opacity duration-300 ${
            thumb.show || dragging
              ? "opacity-100"
              : "opacity-0 group-hover/scroll:opacity-100"
          }`}
        >
          <span
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="absolute left-1.5 w-1.5 cursor-grab touch-none rounded-full bg-icon/50 transition-colors hover:bg-icon active:cursor-grabbing"
            style={{ top: thumb.top, height: thumb.height }}
          />
        </div>
      )}
    </div>
  );
}
