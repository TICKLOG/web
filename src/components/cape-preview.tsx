"use client";

import { createContext, useContext, useState } from "react";

type CapePreview = {
  // Texture hash of the cape to show on the 3D skin instead of the worn one:
  // the hovered cape, else the clicked one; null = the player's own.
  shown: string | null;
  hovered: string | null;
  picked: string | null;
  hover: (hash: string | null) => void;
  pick: (hash: string) => void;
};

const Context = createContext<CapePreview | null>(null);

// Lets the capes list preview a cape on the 3D skin, until the page reloads.
export function CapePreviewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hovered, hover] = useState<string | null>(null);
  const [picked, pick] = useState<string | null>(null);
  return (
    <Context value={{ shown: hovered ?? picked, hovered, picked, hover, pick }}>
      {children}
    </Context>
  );
}

export function useCapePreview() {
  return useContext(Context);
}

export const capeTextureUrl = (hash: string) =>
  `https://textures.minecraft.net/texture/${hash}`;
