// Social links on player pages. Input may be a name or a full channel URL;
// stored is just the name. "" clears a link, null means invalid.

export type Links = {
  twitch: string | null;
  youtube: string | null;
  discordName: string | null;
  github: string | null;
  x: string | null;
};

function strip(input: string, hosts: string[]) {
  let s = input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "");
  for (const h of hosts)
    if (s.toLowerCase().startsWith(h)) s = s.slice(h.length);
  return s.replace(/[/?#].*$/, "");
}

// twitch.tv/<name>: 4–25 letters, digits or underscores.
export function parseTwitch(input: string) {
  const s = strip(input, ["twitch.tv/", "m.twitch.tv/"]);
  if (!s) return "";
  return /^[A-Za-z0-9_]{4,25}$/.test(s) ? s : null;
}

// youtube.com/@<handle>: 3–30 letters, digits, dots, dashes or underscores.
export function parseYoutube(input: string) {
  const s = strip(input, ["youtube.com/", "m.youtube.com/"]).replace(/^@/, "");
  if (!s) return "";
  return /^[A-Za-z0-9._-]{3,30}$/.test(s) ? s : null;
}

// x.com/<handle>: 1–15 letters, digits or underscores.
export function parseX(input: string) {
  const s = strip(input, [
    "x.com/",
    "twitter.com/",
    "mobile.twitter.com/",
  ]).replace(/^@/, "");
  if (!s) return "";
  return /^[A-Za-z0-9_]{1,15}$/.test(s) ? s : null;
}

// Discord username: 2–32 lowercase letters, digits, underscores or dots,
// no two dots in a row. There's no profile URL for it, so it's copied.
export function parseDiscord(input: string) {
  const s = input.trim().replace(/^@/, "").toLowerCase();
  if (!s) return "";
  return /^[a-z0-9_.]{2,32}$/.test(s) && !s.includes("..") ? s : null;
}

// github.com/<name>: 1–39 letters, digits or single dashes, not at the ends.
export function parseGithub(input: string) {
  const s = strip(input, ["github.com/"]).replace(/^@/, "");
  if (!s) return "";
  return /^[A-Za-z0-9](?:-?[A-Za-z0-9]){0,38}$/.test(s) ? s : null;
}
