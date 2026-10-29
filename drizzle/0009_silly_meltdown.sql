CREATE TABLE "ticklog"."hidden_servers" (
	"uuid" uuid NOT NULL,
	"server" text NOT NULL,
	CONSTRAINT "hidden_servers_uuid_server_pk" PRIMARY KEY("uuid","server")
);
--> statement-breakpoint
CREATE TABLE "ticklog"."player_settings" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL
);
