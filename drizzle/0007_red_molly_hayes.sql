DROP INDEX IF EXISTS "idx_intent_fragments_promoted";
--> statement-breakpoint
ALTER TABLE "intent_fragments" DROP COLUMN IF EXISTS "promoted";
--> statement-breakpoint
ALTER TABLE "intent_fragments" DROP COLUMN IF EXISTS "promoted_at";
