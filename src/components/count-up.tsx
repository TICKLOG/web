"use client";

import { useLayoutEffect, useRef } from "react";

const DURATION_MS = 1200;

const format = (n: number) => n.toLocaleString("en-US");

// A number that counts up from 0 when the page opens. The server renders the
// final value, so it's correct without JavaScript; the count starts before the
// first paint after hydration.
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || value === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      // Ease out: fast at first, slowing down towards the final value.
      el.textContent = format(Math.round(value * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    el.textContent = format(0);
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      el.textContent = format(value);
    };
  }, [value]);

  return <span ref={ref}>{format(value)}</span>;
}
