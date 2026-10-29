"use client";

import { useState } from "react";
import type { Links } from "@/lib/links";
import { TwitchIcon, XIcon, YoutubeIcon } from "./brand-icons";
import { DiscordIcon } from "./discord-icon";
import { Icon } from "./icon";

const BOX =
  "flex size-9 cursor-pointer items-center justify-center rounded-[10px] border border-search-border bg-search transition-colors hover:border-search-text";

// Twitch, YouTube, X and Discord of a player, above the activity box. Discord
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
          className={BOX}
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
          className={BOX}
        >
          <YoutubeIcon />
        </a>
      )}
      {links.x && (
        <a
          href={`https://x.com/${links.x}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          title={`x.com/${links.x}`}
          aria-label="X"
          className={BOX}
        >
          <XIcon />
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
          className={BOX}
        >
          {copied ? (
            <Icon className="size-4 text-emerald-500">
              <path d="M20 6 9 17l-5-5" />
            </Icon>
          ) : (
            <DiscordIcon className="size-4 text-[#5865f2]" />
          )}
        </button>
      )}
    </>
  );
}
