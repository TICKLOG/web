"use client";

import { useState, useTransition } from "react";
import { toggleLike } from "@/app/actions/likes";
import { Icon } from "./icon";

const HEART = (
  <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
);
const BOX = "flex h-9 cursor-pointer items-center gap-2 rounded-[10px] border bg-search px-3 text-[14px] transition-colors";
const IDLE = "border-search-border text-search-text hover:border-red-500/50 hover:text-red-400";

// Heart with the like count. Only signed-in (Discord) users can like; for
// others it's a link to the login.
export function LikeButton({
  uuid,
  count,
  liked,
  loggedIn,
}: {
  uuid: string;
  count: number;
  liked: boolean;
  loggedIn: boolean;
}) {
  const [state, setState] = useState({ count, liked });
  const [pending, start] = useTransition();

  if (!loggedIn) {
    return (
      // A plain link: the login route redirects to Discord.
      <a href="/auth/discord/login" title="Login with Discord to Like" className={`${BOX} ${IDLE}`}>
        <Icon className="size-4">{HEART}</Icon>
        <span className="font-semibold text-heading tabular-nums">{count}</span>
      </a>
    );
  }

  function onClick() {
    const before = state;
    setState({ liked: !state.liked, count: state.count + (state.liked ? -1 : 1) });
    start(async () => {
      const next = await toggleLike(uuid);
      setState(next ?? before);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={state.liked}
      className={`${BOX} ${state.liked ? "border-red-500/50 text-red-400" : IDLE}`}
    >
      <Icon className={`size-4 ${state.liked ? "fill-current" : ""}`}>{HEART}</Icon>
      <span className="font-semibold text-heading tabular-nums">{state.count}</span>
    </button>
  );
}
