"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  resetPlaytime,
  setLinks,
  setProfileHidden,
  setServerHidden,
} from "@/app/actions/account-settings";
import type { Links } from "@/lib/links";
import { formatDuration } from "@/lib/format";
import { TwitchIcon, YoutubeIcon } from "./brand-icons";
import { DangerButton } from "./danger-button";
import { DiscordIcon } from "./discord-icon";
import { ServerIcon } from "./server-icon";
import { SettingsRow, SettingsSection } from "./settings-section";
import { Switch } from "./switch";

type Server = { server: string; seconds: number; hidden: boolean };

const LINK_FIELDS = [
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
    placeholder: "handle",
    icon: <YoutubeIcon />,
  },
  {
    key: "discord",
    label: "Discord",
    prefix: "",
    placeholder: "username",
    icon: <DiscordIcon className="size-4" />,
  },
] as const;

// Twitch, YouTube and Discord shown on the player page.
function LinksForm({ uuid, links }: { uuid: string; links: Links }) {
  const [values, setValues] = useState({
    twitch: links.twitch ?? "",
    youtube: links.youtube ?? "",
    discord: links.discord ?? "",
  });
  const [message, setMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await setLinks(uuid, values);
          if ("error" in result && result.error)
            return setMessage({ error: true, text: result.error });
          if ("links" in result && result.links) {
            const l = result.links;
            setValues({
              twitch: l.twitch ?? "",
              youtube: l.youtube ?? "",
              discord: l.discord ?? "",
            });
          }
          setMessage({ error: false, text: "Saved." });
        });
      }}
      className="flex flex-col gap-3 rounded-[14px] border border-search-border p-5"
    >
      {LINK_FIELDS.map((f) => (
        <label key={f.key} className="flex items-center gap-3 text-[14px]">
          <span className="flex w-24 shrink-0 items-center gap-2 text-search-text">
            {f.icon}
            {f.label}
          </span>
          <span className="flex h-9 min-w-0 flex-1 items-center rounded-[9px] border border-search-border bg-search px-3 focus-within:border-search-text">
            {f.prefix && (
              <span className="shrink-0 text-search-text">{f.prefix}</span>
            )}
            <input
              value={values[f.key]}
              onChange={(e) => {
                setValues({ ...values, [f.key]: e.target.value });
                setMessage(null);
              }}
              placeholder={f.placeholder}
              spellCheck={false}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-heading outline-none placeholder:text-search-border"
            />
          </span>
        </label>
      ))}
      <div className="flex items-center justify-end gap-3">
        {message && (
          <p
            className={`text-[13px] ${message.error ? "text-red-500" : "text-emerald-500"}`}
          >
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="h-9 cursor-pointer rounded-[9px] bg-nav-active px-4 text-[14px] font-medium text-nav-active-text transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
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
