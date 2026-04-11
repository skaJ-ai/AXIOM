ALTER TABLE "intent_fragments"
ADD COLUMN "review_status" text DEFAULT 'captured' NOT NULL;
--> statement-breakpoint
ALTER TABLE "intent_fragments"
ADD COLUMN "reviewed_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "intent_fragments"
ADD COLUMN "reviewed_by" uuid;
--> statement-breakpoint
ALTER TABLE "intent_fragments"
ADD CONSTRAINT "intent_fragments_reviewed_by_users_id_fk"
FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
UPDATE "intent_fragments"
SET "review_status" = CASE
  WHEN "promoted" = true THEN 'nominated'
  ELSE 'captured'
END;
--> statement-breakpoint
CREATE INDEX "idx_intent_fragments_review_status" ON "intent_fragments" USING btree ("review_status");
--> statement-breakpoint
CREATE INDEX "idx_intent_fragments_reviewed_by" ON "intent_fragments" USING btree ("reviewed_by");
