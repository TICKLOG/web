"use client";

import { useState } from "react";
import { Icon } from "./icon";

// Lucide "server", for servers without an icon.
function ServerGlyph({ size, dim }: { size: number; dim: boolean }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center"
    >
      <Icon
        className={`size-full ${dim ? "text-search-border" : "text-search-text"}`}
      >
        <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
        <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
        <line x1="6" x2="6.01" y1="6" y2="6" />
        <line x1="6" x2="6.01" y1="18" y2="18" />
      </Icon>
    </span>
  );
}

// A server's icon from its list ping; a plain server glyph when there's none.
export function ServerIcon({
  server,
  size = 16,
  dim = false,
}: {
  server: string | null;
  size?: number;
  dim?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const real = !!server && server.includes(".") && !server.startsWith("127.");
  if (!real || failed) return <ServerGlyph size={size} dim={dim} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny icon from our own route; needs onError
    <img
      src={`/server-icon?s=${encodeURIComponent(server)}`}
      width={size}
      height={size}
      alt=""
      className="shrink-0 rounded-[3px] [image-rendering:pixelated]"
      onError={() => setFailed(true)}
    />
  );
}
