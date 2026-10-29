// Social links on player pages. Input may be a name or a full channel URL;
// stored is just the name. "" clears a link, null means invalid.

export type Links = { twitch: string | null; youtube: string | null; discord: string | null };

function strip(input: string, hosts: string[]) {
  let s = input.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  for (const h of hosts) if (s.toLowerCase().startsWith(h)) s = s.slice(h.length);
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

// Discord usernames: 2–32 lowercase letters, digits, dots or underscores.
export function parseDiscord(input: string) {
  const s = input.trim().replace(/^@/, "").toLowerCase();
  if (!s) return "";
  return /^[a-z0-9._]{2,32}$/.test(s) ? s : null;
}
