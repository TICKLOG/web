import {
  date,
  index,
  integer,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Everything lives in the "ticklog" schema, which Supabase's public Data API
// does not expose (unlike "public").
export const ticklog = pgSchema("ticklog");

export const users = ticklog.table("users", {
  id: uuid().primaryKey().defaultRandom(),
  // Supabase Auth user (Discord login).
  authId: uuid().unique(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const minecraftAccounts = ticklog.table(
  "minecraft_accounts",
  {
    uuid: uuid().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text().notNull(),
    // Sidebar order, chosen by the user (drag and drop).
    position: integer().notNull().default(0),
    linkedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.userId)],
);

// Badges granted to a Minecraft player (by UUID, linked or not). Badge ids
// are defined in lib/badges.ts.
export const playerBadges = ticklog.table(
  "player_badges",
  {
    uuid: uuid().notNull(),
    badge: text().notNull(),
    grantedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.uuid, t.badge] })],
);

// Mojang capes, keyed by texture hash (the last part of the texture URL).
// The name is only known from a linked owner's profile.
export const capes = ticklog.table("capes", {
  hash: text().primaryKey(),
  alias: text(),
});

// Capes a player owns (full list, saved when the account is linked) or was
// seen wearing on their profile page.
export const playerCapes = ticklog.table(
  "player_capes",
  {
    uuid: uuid().notNull(),
    hash: text()
      .notNull()
      .references(() => capes.hash),
    seenAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.uuid, t.hash] })],
);

// Pending mod logins: the mod asks for a server id, joins it through Mojang's
// session server, then trades it for a token. Single use, short-lived.
export const modChallenges = ticklog.table("mod_challenges", {
  serverId: text().primaryKey(),
  uuid: uuid().notNull(),
  name: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// One mod session per Minecraft account; a new game start replaces the old
// token, so two clients can't count time at once.
export const modSessions = ticklog.table("mod_sessions", {
  uuid: uuid().primaryKey(),
  // SHA-256 of the token; the token itself only lives in the game.
  tokenHash: text().notNull().unique(),
  lastBeatAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// Seconds played per player, UTC day and place. `kind` is launcher,
// singleplayer or server; `server` is the address for servers, else "".
export const playtime = ticklog.table(
  "playtime",
  {
    uuid: uuid().notNull(),
    day: date().notNull(),
    kind: text().notNull(),
    server: text().notNull().default(""),
    seconds: integer().notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.uuid, t.day, t.kind, t.server] })],
);

// Legacy Microsoft-only sessions, kept to attach existing users on their
// first Discord login.
export const sessions = ticklog.table(
  "sessions",
  {
    // SHA-256 of the session token; the token itself only lives in the cookie.
    id: text().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    selectedAccount: uuid().references(() => minecraftAccounts.uuid, {
      onDelete: "set null",
    }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.userId)],
);
