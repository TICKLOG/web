"use client";

import { useLayoutEffect, useRef } from "react";

const DURATION_MS = 1200;

const plain = (n: number) => n.toLocaleString("en-US");

// A number that counts up from 0 when the page opens, and from the old to the
// new value when it changes. The server renders the final value, so it's
// correct without JavaScript; the count starts before the first paint after
// hydration.
export function CountUp({
  value,
  format = plain,
}: {
  value: number;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);

  useLayoutEffect(() => {
    const el = ref.current;
    const origin = from.current;
    from.current = value;
    if (!el || value === origin) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      // The frame time can be slightly before `start`.
      const t = Math.min(1, Math.max(0, (now - start) / DURATION_MS));
      // Ease out: fast at first, slowing down towards the final value.
      el.textContent = format(
        Math.round(origin + (value - origin) * (1 - (1 - t) ** 3)),
      );
      if (t < 1) frame = requestAnimationFrame(step);
    };
    el.textContent = format(origin);
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      el.textContent = format(value);
    };
  }, [value, format]);

  return <span ref={ref}>{format(value)}</span>;
}
