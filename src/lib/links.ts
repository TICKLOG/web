// Social links on player pages. Input may be a name or a full channel URL;
// stored is just the name. "" clears a link, null means invalid.

export type Links = {
  twitch: string | null;
  youtube: string | null;
  x: string | null;
  discord: string | null;
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

// discord.gg/<invite>: the code of a Discord server invite (2–32 letters,
// digits or dashes).
export function parseDiscord(input: string) {
  const s = strip(input, ["discord.gg/", "discord.com/invite/", "discordapp.com/invite/"]);
  if (!s) return "";
  return /^[A-Za-z0-9-]{2,32}$/.test(s) ? s : null;
}
