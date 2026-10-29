CREATE TABLE "ticklog"."player_badges" (
	"uuid" uuid NOT NULL,
	"badge" text NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_badges_uuid_badge_pk" PRIMARY KEY("uuid","badge")
);
