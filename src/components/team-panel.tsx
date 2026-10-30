"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { addTeamMember, removeTeamMember } from "@/app/actions/team";
import type { TeamMember } from "@/lib/team";
import { DiscordIcon } from "./discord-icon";
import { Icon } from "./icon";
import { SettingsSection } from "./settings-section";

function Avatar({ url }: { url: string | null }) {
  if (!url)
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[6px] bg-[#5865f2] text-white">
        <DiscordIcon className="size-5" />
      </span>
    );
  return (
    <Image
      src={url}
      alt=""
      width={32}
      height={32}
      unoptimized
      className="size-8 max-w-none shrink-0 rounded-[6px]"
    />
  );
}

// Add field: a Minecraft name whose TickLog account joins the team.
function AddMember() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        startTransition(async () => {
          const result = await addTeamMember(name);
          setError(result.error ?? null);
          if (!result.error) setName("");
        });
      }}
    >
      <div className="flex gap-2">
        <span
          className={`flex h-10 min-w-0 flex-1 items-center rounded-[10px] border bg-search px-3 text-[14px] ${
            error
              ? "border-red-500/60"
              : "border-search-border focus-within:border-search-text"
          }`}
        >
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="Minecraft name"
            aria-label="Minecraft name"
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-heading outline-none placeholder:text-search-border max-md:text-base"
          />
        </span>
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="h-10 shrink-0 cursor-pointer rounded-[10px] bg-heading px-4 text-[14px] font-medium text-background transition-opacity hover:opacity-85 disabled:cursor-default disabled:opacity-40"
        >
          {pending ? "Adding…" : "Add Member"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-[13px] text-red-500">{error}</p>}
    </form>
  );
}

// Team members and the field to add more, on the Team page.
export function TeamPanel({
  members,
  me,
}: {
  members: TeamMember[];
  me: string;
}) {
  const [, startTransition] = useTransition();
  const [list, removeOptimistic] = useOptimistic(
    members,
    (state, userId: string) => state.filter((m) => m.userId !== userId),
  );

  return (
    <>
      {/* One block: the add field right above the list. */}
      <SettingsSection
        title="Members"
        description={`${list.length} ${list.length === 1 ? "member" : "members"} can open this panel. Add someone by a Minecraft name linked to TickLog.`}
        delay={70}
      >
        <AddMember />
        <ul className="mt-3 divide-y divide-search-border rounded-[14px] border border-search-border">
          {list.map((m) => (
            <li
              key={m.userId}
              className="flex items-center gap-3 px-5 py-3 text-[14px]"
            >
              <Avatar url={m.discord.avatarUrl} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-heading">
                  {m.discord.name}
                  {m.userId === me && (
                    <span className="ml-1.5 font-normal text-search-text">
                      (You)
                    </span>
                  )}
                </p>
                {/* Linked Minecraft accounts, each opening its player page. */}
                <p className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-search-text">
                  {m.accounts.length === 0
                    ? "No linked accounts"
                    : m.accounts.map((a) => (
                        <Link
                          key={a.uuid}
                          href={`/@${a.name.toLowerCase()}`}
                          className="flex items-center gap-1.5 transition-colors hover:text-heading"
                        >
                          <Image
                            src={`/heads/${a.uuid}.png`}
                            alt=""
                            width={14}
                            height={14}
                            unoptimized
                            className="size-3.5 rounded-[3px] [image-rendering:pixelated]"
                          />
                          {a.name}
                        </Link>
                      ))}
                </p>
              </div>
              {m.userId !== me && (
                <button
                  type="button"
                  aria-label={`Remove ${m.discord.name}`}
                  title="Remove From Team"
                  onClick={() =>
                    startTransition(async () => {
                      removeOptimistic(m.userId);
                      await removeTeamMember(m.userId);
                    })
                  }
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-search-text transition-colors hover:bg-hover hover:text-red-500"
                >
                  {/* Lucide "user-minus" */}
                  <Icon className="size-4">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="22" x2="16" y1="11" y2="11" />
                  </Icon>
                </button>
              )}
            </li>
          ))}
        </ul>
      </SettingsSection>
    </>
  );
}
