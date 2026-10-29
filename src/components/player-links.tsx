import type { Links } from "@/lib/links";
import { TwitchIcon, XIcon, YoutubeIcon } from "./brand-icons";
import { DiscordIcon } from "./discord-icon";

const BOX =
  "flex size-9 cursor-pointer items-center justify-center rounded-[10px] border border-search-border bg-search transition-colors hover:border-search-text";

// Twitch, YouTube, X and Discord server of a player, above the activity box.
export function PlayerLinks({ links }: { links: Links }) {
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
        <a
          href={`https://discord.gg/${links.discord}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          title={`discord.gg/${links.discord}`}
          aria-label="Discord"
          className={BOX}
        >
          <DiscordIcon className="size-4 text-[#5865f2]" />
        </a>
      )}
    </>
  );
}
