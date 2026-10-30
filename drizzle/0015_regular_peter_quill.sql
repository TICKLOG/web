CREATE TABLE "ticklog"."profile_views" (
	"uuid" uuid NOT NULL,
	"month" date NOT NULL,
	"viewer" text NOT NULL,
	CONSTRAINT "profile_views_uuid_month_viewer_pk" PRIMARY KEY("uuid","month","viewer")
);
