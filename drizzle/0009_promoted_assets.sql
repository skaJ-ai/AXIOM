CREATE TABLE IF NOT EXISTS "promoted_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"scope" text,
	"process_asset_id" uuid NOT NULL,
	"source_intent_id" uuid NOT NULL,
	"source_session_id" uuid,
	"source_work_card_id" uuid,
	"created_by" uuid,
	"workspace_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "promoted_assets" ADD CONSTRAINT "promoted_assets_process_asset_id_process_assets_id_fk" FOREIGN KEY ("process_asset_id") REFERENCES "public"."process_assets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "promoted_assets" ADD CONSTRAINT "promoted_assets_source_intent_id_intent_fragments_id_fk" FOREIGN KEY ("source_intent_id") REFERENCES "public"."intent_fragments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "promoted_assets" ADD CONSTRAINT "promoted_assets_source_session_id_sessions_id_fk" FOREIGN KEY ("source_session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "promoted_assets" ADD CONSTRAINT "promoted_assets_source_work_card_id_work_cards_id_fk" FOREIGN KEY ("source_work_card_id") REFERENCES "public"."work_cards"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "promoted_assets" ADD CONSTRAINT "promoted_assets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "promoted_assets" ADD CONSTRAINT "promoted_assets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_promoted_assets_process_asset_id" ON "promoted_assets" USING btree ("process_asset_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_promoted_assets_source_intent_id" ON "promoted_assets" USING btree ("source_intent_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_promoted_assets_source_work_card_id" ON "promoted_assets" USING btree ("source_work_card_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_promoted_assets_workspace_id" ON "promoted_assets" USING btree ("workspace_id");
