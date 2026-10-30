"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./drift-wall.css";

// Settings from the React Bits example, with square logo tiles.
const COLUMNS = 9;
const TILES_PER_COLUMN = 4;
const TILE = 120;
const GAP = 18;
const TILT = 16;
const TURN = -14;
const DEPTH = 120;
const SPEED = 42;
const VARIANCE = 0.45;
const PARALLAX = 0.6;

// Each column drifts at its own speed, alternating up and down.
const columnFactor = (index: number) =>
  1 + VARIANCE * (((index * 0.6180339887 + 0.35) % 1) * 2 - 1);
const VELOCITIES = Array.from(
  { length: COLUMNS },
  (_, c) => SPEED * columnFactor(c) * (c % 2 === 0 ? 1 : -1),
);
const COPY_HEIGHT = TILES_PER_COLUMN * (TILE + GAP);

// A tilted wall of TickLog logos drifting in columns behind the home page,
// after React Bits' DriftWall. The pointer tilts it slightly, and the hovered
// tile lifts out while its column stops.
export function DriftWall({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [height, setHeight] = useState(600);
  const [active, setActive] = useState<string | null>(null);
  // Animation state, kept out of React so it doesn't rerender every frame.
  const state = useRef({
    offsets: VELOCITIES.map((_, c) => COPY_HEIGHT * ((c * 0.37) % 1)),
    velocities: VELOCITIES.map(() => 0),
    hoveredCol: -1,
    pointer: { x: 0, y: 0 },
    damped: { x: 0, y: 0 },
  });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setHeight(entry.contentRect.height || 600),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Enough copies of each column to cover the (tilted) wall without gaps.
  const copies = Math.max(2, Math.ceil((height * 1.6) / COPY_HEIGHT) + 1);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const s = state.current;
    let last: number | null = null;
    let frame = 0;
    const animate = (ts: number) => {
      const dt = Math.min(0.05, Math.max(0, ts - (last ?? ts)) / 1000);
      last = ts;

      const max = reduced ? 0 : PARALLAX * 8;
      const damp = 1 - Math.exp(-dt / 0.12);
      s.damped.x += (s.pointer.x * max - s.damped.x) * damp;
      s.damped.y += (-s.pointer.y * max - s.damped.y) * damp;
      if (planeRef.current)
        planeRef.current.style.transform =
          `translate(-50%, -50%) scale(1.18) rotateX(${TILT + s.damped.y}deg) ` +
          `rotateY(${TURN + s.damped.x}deg) translateZ(${-DEPTH}px)`;

      trackRefs.current.forEach((el, c) => {
        if (!reduced) {
          const target = s.hoveredCol === c ? 0 : VELOCITIES[c];
          const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
          s.velocities[c] += (target - s.velocities[c]) * ease;
          s.offsets[c] =
            (((s.offsets[c] + s.velocities[c] * dt) % COPY_HEIGHT) +
              COPY_HEIGHT) %
            COPY_HEIGHT;
        }
        if (el) el.style.transform = `translate3d(0, ${-s.offsets[c]}px, 0)`;
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const style = useMemo(
    () =>
      ({
        "--dw-tile-w": `${TILE}px`,
        "--dw-tile-h": `${TILE}px`,
        "--dw-gap": `${GAP}px`,
        "--dw-radius": "18px",
        "--dw-lift": "64px",
        "--dw-dim": 0.55,
        "--dw-edge": "40%",
      }) as React.CSSProperties,
    [],
  );

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`drift-wall ${className}`}
      style={style}
      onPointerMove={(e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        state.current.pointer = {
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5,
        };
        const tile = (
          document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
        )?.closest<HTMLElement>("[data-tile]");
        if (!tile || tile.dataset.tile === active) return;
        state.current.hoveredCol = Number(tile.dataset.col);
        setActive(tile.dataset.tile!);
      }}
      onPointerLeave={() => {
        state.current.pointer = { x: 0, y: 0 };
        state.current.hoveredCol = -1;
        setActive(null);
      }}
    >
      <div ref={planeRef} className="drift-wall__plane">
        {VELOCITIES.map((_, c) => (
          <div key={c} className="drift-wall__col">
            <div
              ref={(el) => {
                trackRefs.current[c] = el;
              }}
              className="drift-wall__track"
            >
              {Array.from({ length: copies * TILES_PER_COLUMN }, (_, i) => {
                const id = `${c}-${i}`;
                return (
                  <div
                    key={id}
                    data-tile={id}
                    data-col={c}
                    className={`drift-wall__tile ${active === id ? "is-active" : ""}`}
                  >
                    <span className="drift-wall__inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo-bold.png" alt="" draggable={false} />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
