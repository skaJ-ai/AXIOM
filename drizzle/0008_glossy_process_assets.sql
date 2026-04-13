CREATE TABLE IF NOT EXISTS "process_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"domain_label" text,
	"description" text,
	"workspace_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "process_assets" ADD CONSTRAINT "process_assets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "work_cards" ADD COLUMN IF NOT EXISTS "process_asset_id" uuid;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work_cards" ADD CONSTRAINT "work_cards_process_asset_id_process_assets_id_fk" FOREIGN KEY ("process_asset_id") REFERENCES "public"."process_assets"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_process_assets_name" ON "process_assets" USING btree ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_process_assets_workspace_id" ON "process_assets" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_work_cards_process_asset_id" ON "work_cards" USING btree ("process_asset_id");
