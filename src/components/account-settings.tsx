"use client";

import { useOptimistic, useTransition } from "react";
import {
  resetPlaytime,
  setFeaturedServer,
  setProfileHidden,
  setServerHidden,
} from "@/app/actions/account-settings";
import { formatDuration } from "@/lib/format";
import { STAR } from "./breakdown";
import { DangerButton } from "./danger-button";
import { Icon } from "./icon";
import { ServerIcon } from "./server-icon";
import { SettingsRow, SettingsSection } from "./settings-section";
import { Switch } from "./switch";

type Server = {
  server: string;
  seconds: number;
  hidden: boolean;
  featured: boolean;
};

// Privacy settings and playtime reset of one linked Minecraft account.
export function AccountSettings({
  uuid,
  hidden,
  servers,
}: {
  uuid: string;
  hidden: boolean;
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
        title="Servers"
        description="Choose which servers show up on your player page and star one to always show it first."
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
                <button
                  type="button"
                  aria-label={`Feature ${s.server}`}
                  aria-pressed={s.featured}
                  title={s.featured ? "Featured" : "Feature"}
                  disabled={s.hidden}
                  onClick={() =>
                    startTransition(async () => {
                      const next = s.featured ? null : s.server;
                      setOptimisticList(
                        list.map((x) => ({
                          ...x,
                          featured: x.server === next,
                        })),
                      );
                      await setFeaturedServer(uuid, next);
                    })
                  }
                  className={`flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[6px] transition-colors disabled:cursor-default disabled:opacity-30 ${
                    s.featured
                      ? "text-yellow-400"
                      : "text-search-text hover:text-yellow-400"
                  }`}
                >
                  <Icon
                    className={`size-4 ${s.featured ? "fill-current" : ""}`}
                  >
                    {STAR}
                  </Icon>
                </button>
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
