"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// The phone menu's state lives on <html data-menu>, like the sidebar's, so the
// sidebar can style itself with the `menu-open:` variant.
function setMenuOpen(open: boolean) {
  if (open) document.documentElement.dataset.menu = "open";
  else delete document.documentElement.dataset.menu;
}

// Top bar on phones (below md), where the sidebar is hidden: logo and a button
// that opens the sidebar as a full-screen menu.
export function MobileBar() {
  const pathname = usePathname();

  // Closes the menu after navigating, and when a link in it is tapped (also
  // one to the page that's already open).
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest("aside a")) setMenuOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2.5 border-b border-border bg-background px-4 md:hidden">
      <Link href="/" className="flex items-center gap-2.5">
        <Image
          src="/logo-bold.png"
          alt="TickLog logo"
          width={28}
          height={28}
          priority
          className="size-7 [filter:var(--logo-filter)]"
        />
        <span className="text-lg font-bold tracking-tight text-heading">
          TICKLOG
        </span>
      </Link>
      <button
        type="button"
        onClick={() =>
          setMenuOpen(document.documentElement.dataset.menu !== "open")
        }
        aria-label="Menu"
        className="group ml-auto flex size-10 cursor-pointer items-center justify-center rounded-[10px] text-icon transition-colors active:bg-hover"
      >
        {/* Two lines that turn into an X while the menu is open. */}
        <span className="relative block h-3 w-[18px]">
          <span className="absolute top-0 left-0 h-[1.75px] w-full rounded-full bg-current transition-transform duration-200 menu-open:translate-y-[5px] menu-open:rotate-45" />
          <span className="absolute bottom-0 left-0 h-[1.75px] w-full rounded-full bg-current transition-transform duration-200 menu-open:-translate-y-[5.25px] menu-open:-rotate-45" />
        </span>
      </button>
    </header>
  );
}
