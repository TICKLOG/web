// Badges a player can have, in display order. Granted by hand for now
// (ticklog.player_badges).
export const BADGES = [
  { id: "staff", label: "Staff Member", description: "Part of the TickLog team.", image: "/badges/name-tag.png" },
  { id: "top10", label: "Top 10", description: "One of the ten players with the most playtime.", image: "/badges/totem.png" },
  { id: "first", label: "#1 Member", description: "One of the first on TickLog.", image: "/badges/heart-of-the-sea.png" },
  { id: "bughunter", label: "Bug Hunter", description: "Found and reported a bug in TickLog.", image: "/badges/command-block.gif" },
  { id: "beta", label: "Beta", description: "Used TickLog during the beta.", image: "/badges/potion.png" },
  { id: "halloween2026", label: "Halloween 2026", description: "Played on Halloween 2026.", image: "/badges/pumpkin.png" },
] as const;

export type Badge = (typeof BADGES)[number];
