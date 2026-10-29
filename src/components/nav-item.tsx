"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sidebar link, highlighted while its page is open. External links open in a
// new tab.
export function NavItem({ label, href, icon }: { label: string; href: string; icon: React.ReactNode }) {
  const active = usePathname() === href;
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        title={label}
        {...(href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
        className={`flex h-10 items-center gap-2.5 rounded-[10px] px-3 text-[15px] transition-colors ${
          active
            ? "bg-nav-active text-nav-active-text"
            : "text-nav-text hover:bg-hover hover:text-heading"
        }`}
      >
        {icon}
        <span className="whitespace-nowrap collapsed:hidden">{label}</span>
      </Link>
    </li>
  );
}

// Dashed line between nav groups, like the reference design.
export function NavDivider() {
  return (
    <li
      aria-hidden="true"
      className="my-3 h-px bg-[linear-gradient(to_right,var(--divider)_50%,transparent_50%)] [background-size:7px_1px]"
    />
  );
}
