"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { SkinTextures } from "@/lib/mojang";
import { PlayerSkin } from "./player-skin";

// Lines above and below the skin (name tag, time) and how far they move in
// over the empty space the viewer leaves around the player.
const LINE = 28;
const TUCK = 0.09;

// A 3D skin as big as the space it gets (3:4), without making that space
// any bigger, with `above` right over the head and `below` right under the
// feet. Sizes are rounded to 20px, so resizing doesn't rebuild the viewer on
// every pixel.
export function FitSkin({
  textures,
  above,
  below,
  className = "",
}: {
  textures: SkinTextures | null;
  above?: React.ReactNode;
  below?: React.ReactNode;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const free = (el.clientHeight - 2 * LINE) / (1 - 2 * TUCK);
      const h = Math.min(free, (el.clientWidth * 4) / 3);
      setHeight(Math.max(0, Math.floor(h / 20) * 20));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, []);

  const tuck = height * TUCK;
  return (
    <div ref={box} className={`relative ${className}`}>
      {height > 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="relative z-20 flex items-end"
            style={{ height: LINE, marginBottom: -tuck }}
          >
            {above}
          </div>
          <div className="relative">
            <PlayerSkin
              textures={textures}
              width={(height * 3) / 4}
              height={height}
            />
          </div>
          <div
            className="relative z-20 flex items-start"
            style={{ height: LINE, marginTop: -tuck }}
          >
            {below}
          </div>
        </div>
      )}
    </div>
  );
}
