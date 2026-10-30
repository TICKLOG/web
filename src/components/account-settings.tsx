"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import {
  resetPlaytime,
  setLink,
  setProfileHidden,
  setServerHidden,
} from "@/app/actions/account-settings";
import type { Links } from "@/lib/links";
import { formatDuration } from "@/lib/format";
import { GitHubIcon, TwitchIcon, XIcon, YoutubeIcon } from "./brand-icons";
import { DangerButton } from "./danger-button";
import { DiscordIcon } from "./discord-icon";
import { ServerIcon } from "./server-icon";
import { SettingsRow, SettingsSection } from "./settings-section";
import { Switch } from "./switch";

type Server = { server: string; seconds: number; hidden: boolean };

const LINK_FIELDS = [
  {
    key: "discordName",
    label: "Discord",
    prefix: "",
    placeholder: "username",
    icon: <DiscordIcon className="size-4 text-[#5865f2]" />,
  },
  {
    key: "twitch",
    label: "Twitch",
    prefix: "twitch.tv/",
    placeholder: "channel",
    icon: <TwitchIcon />,
  },
  {
    key: "youtube",
    label: "YouTube",
    prefix: "youtube.com/@",
    placeholder: "channel",
    icon: <YoutubeIcon />,
  },
  {
    key: "github",
    label: "GitHub",
    prefix: "github.com/",
    placeholder: "username",
    icon: <GitHubIcon />,
  },
  {
    key: "x",
    label: "X",
    prefix: "x.com/",
    placeholder: "channel",
    icon: <XIcon />,
  },
] as const;

type LinkKey = (typeof LINK_FIELDS)[number]["key"];

// One link field; saves itself shortly after typing stops.
function LinkField({
  uuid,
  field,
  initial,
}: {
  uuid: string;
  field: (typeof LINK_FIELDS)[number];
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function save(input: string) {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const result = await setLink(uuid, field.key as LinkKey, input);
      setError("error" in result ? (result.error ?? null) : null);
    }, 600);
  }

  return (
    <li className="px-5 py-3">
      {/* Icon only; the label is for screen readers. */}
      <label
        aria-label={field.label}
        className="flex items-center gap-3 text-[14px]"
      >
        <span className="flex w-5 shrink-0 justify-center">{field.icon}</span>
        <span
          className={`flex h-9 min-w-0 flex-1 items-center rounded-[9px] border bg-search px-3 ${
            error
              ? "border-red-500/60"
              : "border-search-border focus-within:border-search-text"
          }`}
        >
          {field.prefix && (
            <span className="shrink-0 text-search-text">{field.prefix}</span>
          )}
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
              save(e.target.value);
            }}
            placeholder={field.placeholder}
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-heading outline-none placeholder:text-search-border max-md:text-base"
          />
        </span>
      </label>
      {error && <p className="mt-1.5 ml-8 text-[13px] text-red-500">{error}</p>}
    </li>
  );
}

// Discord, Twitch, YouTube, GitHub and X shown on the player page.
function LinksForm({ uuid, links }: { uuid: string; links: Links }) {
  return (
    <ul className="divide-y divide-search-border rounded-[14px] border border-search-border">
      {LINK_FIELDS.map((f) => (
        <LinkField
          key={f.key}
          uuid={uuid}
          field={f}
          initial={links[f.key] ?? ""}
        />
      ))}
    </ul>
  );
}

// Privacy settings, links and playtime reset of one linked Minecraft account.
export function AccountSettings({
  uuid,
  hidden,
  links,
  servers,
}: {
  uuid: string;
  hidden: boolean;
  links: Links;
  servers: Server[];
}) {
  const [, startTransition] = useTransition();
  const [profileHidden, setOptimisticHidden] = useOptimistic(hidden);
  const [list, setOptimisticList] = useOptimistic(servers);

  return (
    <>
      <SettingsSection
        title="Hide Profile"
        description="Nobody can see your playtime."
        delay={70}
      >
        <SettingsRow text="Your stats show as hidden on your player page.">
          <Switch
            label="Hide Profile"
            checked={profileHidden}
            onChange={(next) =>
              startTransition(async () => {
                setOptimisticHidden(next);
                await setProfileHidden(uuid, next);
              })
            }
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title="Links"
        description="Show your channels on your player page."
        delay={105}
      >
        <LinksForm uuid={uuid} links={links} />
      </SettingsSection>

      <SettingsSection
        title="Servers"
        description="Choose which servers show up on your player page. Their time still counts."
        delay={140}
      >
        {list.length === 0 ? (
          <SettingsRow text="No servers yet.">{null}</SettingsRow>
        ) : (
          <ul className="divide-y divide-search-border rounded-[14px] border border-search-border">
            {list.map((s) => (
              <li
                key={s.server}
                className="flex items-center gap-3 px-5 py-3 text-[14px]"
              >
                <ServerIcon server={s.server} size={20} />
                <span
                  className={`min-w-0 flex-1 truncate font-mono ${s.hidden ? "text-search-text" : "text-heading"}`}
                >
                  {s.server}
                </span>
                <span className="text-search-text tabular-nums">
                  {formatDuration(s.seconds)}
                </span>
                <Switch
                  label={`Show ${s.server}`}
                  checked={!s.hidden}
                  onChange={(show) =>
                    startTransition(async () => {
                      setOptimisticList(
                        list.map((x) =>
                          x.server === s.server ? { ...x, hidden: !show } : x,
                        ),
                      );
                      await setServerHidden(uuid, s.server, !show);
                    })
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </SettingsSection>

      <SettingsSection
        title="Reset Playtime"
        description="This removes all playtime tracked for this account."
        delay={210}
      >
        <SettingsRow text="Permanently delete the playtime of this account.">
          <DangerButton
            label="Reset Playtime"
            confirmLabel="Confirm Reset"
            pendingLabel="Resetting…"
            action={() => resetPlaytime(uuid)}
          />
        </SettingsRow>
      </SettingsSection>
    </>
  );
}
