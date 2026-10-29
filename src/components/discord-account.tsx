"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { logout } from "@/app/actions/accounts";
import type { DiscordProfile } from "@/lib/auth/user";
import { DiscordIcon } from "./discord-icon";
import { Icon, LogOutIcon } from "./icon";
import { setSidebarCollapsed } from "./sidebar-controls";

const DISCORD_INVITE_URL = "https://discord.gg/JXaJVXewtX";

// 44px high around a 32px avatar: 6px on every side, expanded and collapsed
// (where only the avatar remains).
const card =
  "flex h-11 w-full items-center gap-2.5 rounded-[10px] border border-search-border bg-search pr-[9px] pl-[5px] text-left text-heading collapsed:pr-[5px]";

const chevron = "origin-center transition-transform duration-200 ease-out [transform-box:fill-box]";

// Menu items build up one after another (with staggered delays).
const menuItemRise = "animate-[rise_220ms_ease-out_backwards] motion-reduce:animate-none";

const menuItem =
  "flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-[9px] text-left text-[15px] text-nav-text transition-colors hover:bg-hover hover:text-heading";

function Avatar({ profile }: { profile: DiscordProfile }) {
  if (!profile.avatarUrl) {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[6px] bg-[#5865f2] text-white">
        <DiscordIcon className="size-5" />
      </span>
    );
  }
  return (
    <Image
      src={profile.avatarUrl}
      alt=""
      width={32}
      height={32}
      unoptimized
      className="size-8 max-w-none shrink-0 rounded-[6px]"
    />
  );
}

// Discord login at the bottom of the sidebar; once logged in, a menu with
// settings, the Discord server and logout. `profile` is null while signed
// out.
export function DiscordAccount({ profile }: { profile: DiscordProfile | null }) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!profile) {
    return (
      // A plain link: the login route redirects to Discord.
      <a
        href="/auth/discord/login"
        title="Login with Discord"
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] bg-[#5865f2] px-[9px] text-[15px] font-medium text-white transition-colors hover:bg-[#4752c4]"
      >
        <DiscordIcon />
        <span className="truncate whitespace-nowrap collapsed:hidden">Login with Discord</span>
      </a>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      {open && (
        <div
          role="menu"
          className="absolute inset-x-0 bottom-full mb-2 animate-[rise_180ms_ease-out] rounded-[12px] border border-search-border bg-background p-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.18)] motion-reduce:animate-none"
        >
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={`${menuItem} ${menuItemRise} [animation-delay:40ms]`}
          >
            <span className="flex size-6 items-center justify-center">
              {/* Rounded hexagon with a slash, like the reference design. */}
              <Icon>
                <path d="M3.38 13.57 Q2.5 12 3.38 10.43 L6.12 5.57 Q7 4 8.8 4 L15.2 4 Q17 4 17.88 5.57 L20.62 10.43 Q21.5 12 20.62 13.57 L17.88 18.43 Q17 20 15.2 20 L8.8 20 Q7 20 6.12 18.43Z" />
                <path d="m9.75 9 4.5 6" />
              </Icon>
            </span>
            Settings
          </Link>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className={`${menuItem} ${menuItemRise} [animation-delay:80ms]`}
          >
            <span className="flex size-6 items-center justify-center">
              <DiscordIcon />
            </span>
            Discord
          </a>

          <div aria-hidden="true" className={`mx-[9px] my-1 border-t border-search-border ${menuItemRise} [animation-delay:100ms]`} />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              startTransition(() => logout());
            }}
            className={`${menuItem} ${menuItemRise} [animation-delay:120ms] hover:text-red-500`}
          >
            <span className="flex size-6 items-center justify-center">
              <LogOutIcon />
            </span>
            Log Out
          </button>
        </div>
      )}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title={profile.name}
        onClick={() => {
          if (document.documentElement.dataset.sidebar === "collapsed") {
            setSidebarCollapsed(false, () => setOpen(true));
          } else {
            setOpen(!open);
          }
        }}
        className={`${card} cursor-pointer transition-colors hover:bg-hover ${open ? "bg-hover" : ""}`}
      >
        <Avatar profile={profile} />
        <span className="flex min-w-0 flex-col collapsed:hidden">
          <span className="truncate text-[15px] leading-5 font-medium">{profile.name}</span>
          {profile.username && (
            <span className="truncate text-[13px] leading-4 text-search-text">@{profile.username}</span>
          )}
        </span>
        {/* Lucide "chevrons-up-down"; each chevron flips while the menu is open. */}
        <Icon className="ml-auto size-[18px] text-search-text collapsed:hidden">
          <path d="m7 15 5 5 5-5" className={`${chevron} ${open ? "-scale-y-100" : ""}`} />
          <path d="m7 9 5-5 5 5" className={`${chevron} ${open ? "-scale-y-100" : ""}`} />
        </Icon>
      </button>
    </div>
  );
}
