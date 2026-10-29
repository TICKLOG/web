"use client";

import { useState } from "react";
import type { Links } from "@/lib/links";
import { TwitchIcon, YoutubeIcon } from "./brand-icons";
import { DiscordIcon } from "./discord-icon";
import { Icon } from "./icon";

const BOX =
  "flex size-9 cursor-pointer items-center justify-center rounded-[10px] border border-search-border bg-search text-search-text transition-colors";

// Twitch, YouTube and Discord of a player, next to streak and likes. Discord
// has no profile links, so clicking it copies the username.
export function PlayerLinks({ links }: { links: Links }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      {links.twitch && (
        <a
          href={`https://twitch.tv/${links.twitch}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          title={`twitch.tv/${links.twitch}`}
          aria-label="Twitch"
          className={`${BOX} hover:text-[#9146ff]`}
        >
          <TwitchIcon />
        </a>
      )}
      {links.youtube && (
        <a
          href={`https://youtube.com/@${links.youtube}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          title={`youtube.com/@${links.youtube}`}
          aria-label="YouTube"
          className={`${BOX} hover:text-[#ff0000]`}
        >
          <YoutubeIcon />
        </a>
      )}
      {links.discord && (
        <button
          type="button"
          title={copied ? "Copied" : `${links.discord} (Copy)`}
          aria-label={`Copy Discord username ${links.discord}`}
          onClick={() =>
            navigator.clipboard.writeText(links.discord!).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            })
          }
          className={`${BOX} hover:text-[#5865f2]`}
        >
          {copied ? (
            <Icon className="size-4 text-emerald-500">
              <path d="M20 6 9 17l-5-5" />
            </Icon>
          ) : (
            <DiscordIcon className="size-4" />
          )}
        </button>
      )}
    </>
  );
}
