import Image from "next/image";
import Link from "next/link";
import { AccountsNavLoader, DiscordAccountLoader } from "./account-loaders";
import { ModrinthIcon } from "./modrinth-icon";
import { NavDivider, NavItem } from "./nav-item";
import { SearchPlayer } from "./search-player";
import { SidebarToggle } from "./sidebar-controls";

// Rounded pentagon with a smile, like the reference design's home icon.
function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5 shrink-0"
    >
      <path d="M9.90 4.53Q12.00 3.00 14.10 4.53L19.03 8.11Q21.13 9.63 20.33 12.11L18.45 17.89Q17.64 20.37 15.04 20.37L8.96 20.37Q6.36 20.37 5.55 17.89L3.67 12.11Q2.87 9.63 4.97 8.11Z" />
      <path d="M10 15.5q2 1.5 4 0" />
    </svg>
  );
}

// Lucide "trophy" icon.
function LeaderboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5 shrink-0"
    >
      <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
      <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
      <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
      <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
    </svg>
  );
}

// GitHub brand mark (Simple Icons).
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5 shrink-0">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

// Lucide "life-buoy" icon.
function SupportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5 shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m4.93 4.93 4.24 4.24" />
      <path d="m14.83 9.17 4.24-4.24" />
      <path d="m14.83 14.83 4.24 4.24" />
      <path d="m9.17 14.83-4.24 4.24" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

// Lucide "scale" icon.
function LegalNoticeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5 shrink-0"
    >
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

// Lucide "shield" icon.
function PrivacyPolicyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5 shrink-0"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

// Lucide "award" icon.
function BadgesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5 shrink-0"
    >
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </svg>
  );
}

// Collapsed: 85px = 1px border + 2 × 20px padding + a 44px column, so icons
// sit centered with equal space on every side.
export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-dvh w-80 shrink-0 flex-col overflow-hidden border-r border-border px-5 pt-[30px] pb-5 transition-[width] duration-300 ease-out max-md:hidden collapsed:w-[85px] expanding:w-80">
      <div className="relative flex items-center gap-2.5 pl-1.5">
        <Image
          src="/logo-bold.png"
          alt="TickLog logo"
          width={32}
          height={32}
          priority
          className="size-8 [filter:var(--logo-filter)]"
        />
        <Link
          href="/"
          className="text-xl font-bold tracking-tight whitespace-nowrap text-heading collapsed:hidden"
        >
          TICKLOG
        </Link>
        <SidebarToggle />
      </div>

      <SearchPlayer />

      <nav className="mt-6">
        <ul className="flex flex-col gap-1">
          <NavItem label="Home" href="/" icon={<HomeIcon />} />
          <NavItem label="Leaderboard" href="/leaderboard" icon={<LeaderboardIcon />} />
          <NavItem label="Badges" href="/badges" icon={<BadgesIcon />} />
          {/* Only shown when logged in with Discord. */}
          <AccountsNavLoader />
          <NavDivider />
          {/* Not published yet: modrinth.com/mod/ticklog once it is. */}
          <NavItem label="Download" href="https://modrinth.com/mod/ticklog" icon={<ModrinthIcon />} />
          <NavItem label="GitHub" href="https://github.com/ticklog" icon={<GitHubIcon />} />
          <NavItem label="Support" href="https://github.com/TICKLOG/mod/issues" icon={<SupportIcon />} />
          <NavDivider />
          <NavItem label="Legal Notice" href="/legal-notice" icon={<LegalNoticeIcon />} />
          <NavItem label="Privacy Policy" href="/privacy-policy" icon={<PrivacyPolicyIcon />} />
        </ul>
      </nav>

      <div className="mt-auto">
        <DiscordAccountLoader />
      </div>
    </aside>
  );
}
