"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { SkinTextures } from "@/lib/mojang";
import { PlayerSkin } from "./player-skin";

// A 3D skin as big as the space it gets (3:4), without making that space
// any bigger. Sizes are rounded to 20px, so resizing doesn't rebuild the
// viewer on every pixel.
export function FitSkin({
  textures,
  className = "",
}: {
  textures: SkinTextures | null;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const h = Math.min(el.clientHeight, (el.clientWidth * 4) / 3);
      setHeight(Math.floor(h / 20) * 20);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className={`relative ${className}`}>
      {height > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayerSkin
            textures={textures}
            width={(height * 3) / 4}
            height={height}
          />
        </div>
      )}
    </div>
  );
}
