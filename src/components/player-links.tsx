import type { Links } from "@/lib/links";
import { GitHubIcon, TwitchIcon, XIcon, YoutubeIcon } from "./brand-icons";
import { DiscordLink } from "./discord-link";

const BOX =
  "flex size-9 cursor-pointer items-center justify-center rounded-[10px] border border-search-border bg-search transition-colors hover:border-search-text";

// Discord, Twitch, YouTube, GitHub and X of a player, above the activity box.
export function PlayerLinks({ links }: { links: Links }) {
  return (
    <>
      {links.discordName && (
        <DiscordLink name={links.discordName} className={BOX} />
      )}
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
      {links.github && (
        <a
          href={`https://github.com/${links.github}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          title={`github.com/${links.github}`}
          aria-label="GitHub"
          className={BOX}
        >
          <GitHubIcon />
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
    </>
  );
}
