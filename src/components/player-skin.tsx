"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  type BackEquipment,
  IdleAnimation,
  type PlayerObject,
  SkinViewer,
} from "skinview3d";
import type { SkinTextures } from "@/lib/mojang";
import { capeTextureUrl, useCapePreview } from "./cape-preview";
import { Icon } from "./icon";

// Resting rotation: turned slightly to the side.
const BASE = -0.45;
const PLACEHOLDER_SKIN = "/placeholder-skin.png";

// Icons for the cape/elytra switch.
const EQUIPMENT = [
  {
    id: "cape",
    label: "Cape",
    icon: (
      <>
        <path d="M9 3.5c1.5 1.3 4.5 1.3 6 0" />
        <path d="M9 3.5C7 4.5 5.5 5.5 5 7L4 20.5c1.3.8 2.7.8 4 0 1.3.8 2.7.8 4 0 1.3.8 2.7.8 4 0 1.3.8 2.7.8 4 0L19 7c-.5-1.5-2-2.5-4-3.5" />
        <path d="M9.5 8 9 18" />
        <path d="M14.5 8 15 18" />
      </>
    ),
  },
  {
    id: "elytra",
    label: "Elytra",
    icon: (
      <>
        <path d="M11 6C8.5 3.5 5 3 3 4.5l1.5 15c2.7-2 5-5.5 6.5-9.5Z" />
        <path d="M13 6c2.5-2.5 6-3 8-1.5l-1.5 15c-2.7-2-5-5.5-6.5-9.5Z" />
        <path d="M4 9.5 9.5 8" />
        <path d="m4.5 14 5-3" />
        <path d="m20 9.5-5.5-1.5" />
        <path d="m19.5 14-5-3" />
      </>
    ),
  },
] as const;

// Idle pose with arms out a little, legs shifting and the head looking around.
class BreatheAnimation extends IdleAnimation {
  animate(player: PlayerObject) {
    super.animate(player);
    const s = player.skin;
    s.leftArm.rotation.z += 0.12;
    s.rightArm.rotation.z -= 0.12;
    s.leftLeg.rotation.z = 0.08 + Math.sin(this.progress * 0.8) * 0.02;
    s.leftLeg.rotation.x = Math.sin(this.progress * 0.8) * 0.04;
    s.rightLeg.rotation.z = -0.08 - Math.sin(this.progress * 0.8) * 0.02;
    s.rightLeg.rotation.x = -Math.sin(this.progress * 0.8) * 0.04;
    s.head.rotation.y = -0.15 + Math.sin(this.progress * 0.5) * 0.15;
    player.cape.rotation.x = 0.18 + Math.sin(this.progress * 0.7) * 0.04;
  }
}

// 3D skin that breathes, turns while dragged and springs back on release.
export function PlayerSkin({
  textures,
  width = 320,
  height = 480,
}: {
  textures: SkinTextures | null;
  width?: number;
  height?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const viewer = useRef<SkinViewer | null>(null);
  const drag = useRef<{ x: number; rot: number } | null>(null);
  const anim = useRef(0);
  const placeholder = useRef<Promise<unknown>>(Promise.resolve());
  const [equipment, setEquipment] = useState<BackEquipment>("cape");
  const [loaded, setLoaded] = useState(false);
  // Bumped when the viewer is (re)created so the textures are applied again.
  const [gen, setGen] = useState(0);
  // Bumped when the WebGL context is lost so the viewer gets rebuilt.
  const [reset, setReset] = useState(0);
  const preview = useCapePreview();
  // A cape previewed from the capes list replaces the worn one.
  const cape = preview?.shown
    ? capeTextureUrl(preview.shown)
    : (textures?.cape ?? null);

  function setRotation(rot: number) {
    if (viewer.current) viewer.current.playerWrapper.rotation.y = rot;
  }

  // Turns to `to` (default: the resting rotation).
  function turnTo(to = BASE, duration = 450) {
    if (!viewer.current) return;
    const from = viewer.current.playerWrapper.rotation.y;
    // Starts at the first frame.
    let start: number | null = null;
    cancelAnimationFrame(anim.current);
    const step = (now: number) => {
      start ??= now;
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - (1 - t) ** 3;
      setRotation(from + (to - from) * e);
      if (t < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }

  function snapBack() {
    turnTo();
  }

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const onLost = (e: Event) => {
      e.preventDefault();
      setReset((r) => r + 1);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    const v = new SkinViewer({ canvas, width, height });
    v.zoom = 0.8;
    v.controls.enableZoom = false;
    v.controls.enablePan = false;
    v.controls.enableRotate = false;
    v.autoRotate = false;
    v.animation = new BreatheAnimation();
    v.animation.speed = 0.9;
    placeholder.current = v.loadSkin(PLACEHOLDER_SKIN).catch(() => {});
    viewer.current = v;
    v.playerWrapper.rotation.y = BASE;
    setLoaded(false);
    setGen((g) => g + 1);
    return () => {
      cancelAnimationFrame(anim.current);
      canvas.removeEventListener("webglcontextlost", onLost);
      v.dispose();
      viewer.current = null;
    };
  }, [width, height, reset]);

  useEffect(() => {
    const v = viewer.current;
    if (!v || !textures) return;
    let alive = true;
    // textures.minecraft.net occasionally fails; retry with backoff.
    const loadWithRetry = async () => {
      for (let i = 0; i < 4; i++) {
        try {
          await v.loadSkin(textures.skin, { model: textures.model });
          return true;
        } catch {}
        if (!alive) return false;
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
      }
      return false;
    };
    placeholder.current.then(loadWithRetry).then((ok) => {
      if (ok && alive) setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [textures, gen]);

  useEffect(() => {
    const v = viewer.current;
    if (!v) return;
    if (cape) v.loadCape(cape, { backEquipment: equipment }).catch(() => {});
    else v.resetCape();
  }, [cape, gen, equipment]);

  // Hovering a cape in the list turns the player around to show it until the
  // pointer leaves.
  const hovered = preview?.hovered ?? null;
  const onHoverChange = useEffectEvent((hash: string | null) =>
    turnTo(hash ? BASE + Math.PI : BASE, 600),
  );
  useEffect(() => onHoverChange(hovered), [hovered]);

  return (
    <>
      {cape && (
        <div className="absolute top-3 right-3 z-30 flex h-8 items-center gap-0.5 rounded-[8px] border border-search-border bg-background p-0.5">
          {EQUIPMENT.map((e) => (
            <button
              key={e.id}
              type="button"
              aria-label={e.label}
              aria-pressed={equipment === e.id}
              onClick={() => setEquipment(e.id)}
              className={`flex h-full cursor-pointer items-center rounded-[6px] px-2 transition-colors ${
                equipment === e.id
                  ? "bg-search-border text-heading"
                  : "text-nav-text hover:text-heading"
              }`}
            >
              <Icon className="size-4">{e.icon}</Icon>
            </button>
          ))}
        </div>
      )}
      <div
        role="slider"
        aria-label="Rotate skin"
        aria-valuenow={0}
        tabIndex={0}
        onPointerDown={(e) => {
          if (!viewer.current) return;
          cancelAnimationFrame(anim.current);
          drag.current = {
            x: e.clientX,
            rot: viewer.current.playerWrapper.rotation.y,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setRotation(drag.current.rot + (e.clientX - drag.current.x) * 0.012);
        }}
        onPointerUp={() => {
          drag.current = null;
          snapBack();
        }}
        onPointerCancel={() => {
          drag.current = null;
          snapBack();
        }}
        className="relative cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ width, height }}
      >
        <canvas
          ref={ref}
          className={`pointer-events-none relative z-10 ${loaded ? "" : "animate-pulse"}`}
        />
      </div>
    </>
  );
}
