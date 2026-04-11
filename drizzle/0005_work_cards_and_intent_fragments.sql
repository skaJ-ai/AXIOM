CREATE TABLE "work_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"audience" text,
	"process_label" text,
	"sensitivity" text DEFAULT 'general' NOT NULL,
	"owner_id" uuid,
	"workspace_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "work_cards" ADD CONSTRAINT "work_cards_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "work_cards" ADD CONSTRAINT "work_cards_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "work_card_id" uuid;
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_work_card_id_work_cards_id_fk" FOREIGN KEY ("work_card_id") REFERENCES "public"."work_cards"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "intent_fragments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"message_id" uuid,
	"work_card_id" uuid,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"speaker" text,
	"scope" text,
	"confidence" text DEFAULT 'medium' NOT NULL,
	"promoted" boolean DEFAULT false NOT NULL,
	"promoted_at" timestamp with time zone,
	"workspace_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "intent_fragments" ADD CONSTRAINT "intent_fragments_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "intent_fragments" ADD CONSTRAINT "intent_fragments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "intent_fragments" ADD CONSTRAINT "intent_fragments_work_card_id_work_cards_id_fk" FOREIGN KEY ("work_card_id") REFERENCES "public"."work_cards"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "intent_fragments" ADD CONSTRAINT "intent_fragments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_work_cards_owner_id" ON "work_cards" USING btree ("owner_id");
--> statement-breakpoint
CREATE INDEX "idx_work_cards_status" ON "work_cards" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "idx_work_cards_workspace_id" ON "work_cards" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "idx_sessions_work_card_id" ON "sessions" USING btree ("work_card_id");
--> statement-breakpoint
CREATE INDEX "idx_intent_fragments_message_id" ON "intent_fragments" USING btree ("message_id");
--> statement-breakpoint
CREATE INDEX "idx_intent_fragments_promoted" ON "intent_fragments" USING btree ("promoted");
--> statement-breakpoint
CREATE INDEX "idx_intent_fragments_session_id" ON "intent_fragments" USING btree ("session_id");
--> statement-breakpoint
CREATE INDEX "idx_intent_fragments_type" ON "intent_fragments" USING btree ("type");
--> statement-breakpoint
CREATE INDEX "idx_intent_fragments_work_card_id" ON "intent_fragments" USING btree ("work_card_id");
--> statement-breakpoint
CREATE INDEX "idx_intent_fragments_workspace_id" ON "intent_fragments" USING btree ("workspace_id");
