"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { reorderAccounts, unlinkAccount } from "@/app/actions/accounts";
import { Icon } from "./icon";
import { NavDivider } from "./nav-item";
import { setSidebarCollapsed } from "./sidebar-controls";

export type NavAccount = { uuid: string; name: string };

function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 21 21" aria-hidden="true" className="size-4 shrink-0">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

// Curved connector from the vertical line to each row, like the reference
// design; the line continues past every row but the last.
const branch =
  "relative before:pointer-events-none before:absolute before:top-0 before:-left-4 before:h-1/2 before:w-3 before:rounded-bl-[6px] before:border-b before:border-l before:border-[var(--divider)] not-last:after:pointer-events-none not-last:after:absolute not-last:after:top-0 not-last:after:-bottom-0.5 not-last:after:-left-4 not-last:after:border-l not-last:after:border-[var(--divider)] collapsed:before:hidden collapsed:after:hidden";

const subItem =
  "flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 text-left text-[14px] transition-colors collapsed:px-3";

// "Accounts" nav item that expands into the linked Minecraft accounts.
export function AccountsNav({ accounts }: { accounts: NavAccount[] }) {
  const pathname = usePathname();
  const [optimisticAccounts, setOptimisticAccounts] = useOptimistic(accounts);
  // While dragging: the account being moved and the order shown meanwhile.
  const [drag, setDrag] = useState<{
    uuid: string;
    order: NavAccount[];
  } | null>(null);
  const list = drag?.order ?? optimisticAccounts;
  const [, startTransition] = useTransition();

  return (
    <>
      <NavDivider />
      <li>
        {/* Always expanded; only clickable in the collapsed sidebar, to open it. */}
        <button
          type="button"
          title="Accounts"
          onClick={() => {
            if (document.documentElement.dataset.sidebar === "collapsed")
              setSidebarCollapsed(false);
          }}
          className="flex h-10 w-full cursor-default items-center gap-2.5 rounded-[10px] px-3 text-[15px] text-nav-text transition-colors collapsed:cursor-pointer collapsed:hover:bg-hover collapsed:hover:text-heading"
        >
          {/* Lucide "users" */}
          <Icon>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </Icon>
          <span className="whitespace-nowrap collapsed:hidden">Accounts</span>
        </button>

        {/* Collapsed sidebar: only the heads (and the Microsoft logo) remain, on
            the icon axis in 44px rows, also while it expands. */}
        <ul className="mt-1 ml-[21px] flex flex-col gap-0.5 pl-4 collapsed:ml-0 collapsed:pl-0">
          {list.map((account) => {
            const href = `/accounts/${account.name.toLowerCase()}`;
            // Marked only while its page is open.
            const isActive = pathname === href;
            return (
              <li
                key={account.uuid}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  setDrag({ uuid: account.uuid, order: list });
                }}
                onDragOver={(e) => {
                  if (!drag) return;
                  e.preventDefault();
                  if (drag.uuid === account.uuid) return;
                  // Move the dragged account to this row's place.
                  const order = drag.order.filter((a) => a.uuid !== drag.uuid);
                  const moved = drag.order.find((a) => a.uuid === drag.uuid)!;
                  order.splice(drag.order.indexOf(account), 0, moved);
                  setDrag({ ...drag, order });
                }}
                onDrop={(e) => e.preventDefault()}
                onDragEnd={() => {
                  if (!drag) return;
                  const order = drag.order;
                  setDrag(null);
                  if (
                    order.every(
                      (a, i) => a.uuid === optimisticAccounts[i]?.uuid,
                    )
                  )
                    return;
                  startTransition(async () => {
                    setOptimisticAccounts(order);
                    await reorderAccounts(order.map((a) => a.uuid));
                  });
                }}
                className={`group/row ${branch} flex items-center rounded-[8px] collapsed:w-11 ${isActive ? "bg-nav-active" : "hover:bg-hover"} ${drag?.uuid === account.uuid && !isActive ? "bg-hover" : ""}`}
              >
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  draggable={false}
                  title={account.name}
                  className={`${subItem} min-w-0 flex-1 ${isActive ? "text-nav-active-text" : "text-nav-text hover:text-heading"}`}
                >
                  <Image
                    src={`/heads/${account.uuid}.png`}
                    alt=""
                    width={20}
                    height={20}
                    unoptimized
                    draggable={false}
                    className="size-5 max-w-none shrink-0 rounded-[4px] [image-rendering:pixelated]"
                  />
                  <span className="truncate collapsed:hidden">
                    {account.name}
                  </span>
                </Link>
                <Link
                  href={`/@${account.name.toLowerCase()}`}
                  aria-label={`Open ${account.name}'s Player Page`}
                  title="Open Player Page"
                  draggable={false}
                  className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-search-text opacity-0 transition-colors group-hover/row:opacity-100 hover:text-green-400 focus-visible:opacity-100 collapsed:hidden"
                >
                  {/* Lucide "external-link" */}
                  <Icon className="size-4">
                    <path d="M15 3h6v6" />
                    <path d="M10 14 21 3" />
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  </Icon>
                </Link>
                <button
                  type="button"
                  aria-label={`Unlink ${account.name}`}
                  title={`Unlink ${account.name}`}
                  onClick={() =>
                    startTransition(() => unlinkAccount(account.uuid))
                  }
                  className="mr-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[6px] text-search-text opacity-0 transition-colors group-hover/row:opacity-100 hover:text-red-500 focus-visible:opacity-100 collapsed:hidden"
                >
                  {/* Lucide "unlink" */}
                  <Icon className="size-4">
                    <path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" />
                    <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" />
                    <line x1="8" x2="8" y1="2" y2="5" />
                    <line x1="2" x2="5" y1="8" y2="8" />
                    <line x1="16" x2="16" y1="19" y2="22" />
                    <line x1="19" x2="22" y1="16" y2="16" />
                  </Icon>
                </button>
              </li>
            );
          })}
          <li className={`${branch} collapsed:w-11`}>
            {/* A plain link: the route redirects to Microsoft. */}
            <a
              href="/auth/microsoft/login"
              title="Add Account"
              className={`${subItem} text-nav-text hover:bg-hover hover:text-heading`}
            >
              <span className="flex size-5 items-center justify-center">
                <MicrosoftLogo />
              </span>
              <span className="whitespace-nowrap collapsed:hidden">
                Add Account
              </span>
            </a>
          </li>
        </ul>
      </li>
    </>
  );
}
