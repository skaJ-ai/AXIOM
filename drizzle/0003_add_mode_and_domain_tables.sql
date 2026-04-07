-- Phase 0: Add mode column to sessions + create domain/knowledge tables
-- Migration: 0003_add_mode_and_domain_tables

-- Step 1: Add new columns to sessions
ALTER TABLE "sessions" ADD COLUMN "mode" text DEFAULT 'write' NOT NULL;
ALTER TABLE "sessions" ADD COLUMN "parent_session_id" uuid;
ALTER TABLE "sessions" ADD COLUMN "report_type" text;

-- Step 2: Migrate existing templateType → mode='write' (all existing sessions become write mode)
UPDATE "sessions" SET "mode" = 'write' WHERE "mode" IS NULL OR "mode" = '';

-- Step 3: Make template_type nullable (no longer required)
ALTER TABLE "sessions" ALTER COLUMN "template_type" DROP NOT NULL;

-- Step 4: Add mode index
CREATE INDEX IF NOT EXISTS "idx_sessions_mode" ON "sessions" ("mode");

-- Step 5: Create ideas table (diverge mode)
CREATE TABLE IF NOT EXISTS "ideas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL REFERENCES "sessions"("id") ON DELETE CASCADE,
  "content" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_ideas_session_id" ON "ideas" ("session_id");

-- Step 6: Create clusters table (diverge mode)
CREATE TABLE IF NOT EXISTS "clusters" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL REFERENCES "sessions"("id") ON DELETE CASCADE,
  "label" text NOT NULL,
  "summary" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_clusters_session_id" ON "clusters" ("session_id");

-- Step 7: Create cluster_ideas join table
CREATE TABLE IF NOT EXISTS "cluster_ideas" (
  "cluster_id" uuid NOT NULL REFERENCES "clusters"("id") ON DELETE CASCADE,
  "idea_id" uuid NOT NULL REFERENCES "ideas"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_cluster_ideas_cluster_id" ON "cluster_ideas" ("cluster_id");
CREATE INDEX IF NOT EXISTS "idx_cluster_ideas_idea_id" ON "cluster_ideas" ("idea_id");

-- Step 8: Create claims table (synthesize mode)
CREATE TABLE IF NOT EXISTS "claims" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL REFERENCES "sessions"("id") ON DELETE CASCADE,
  "content" text NOT NULL,
  "confidence" text DEFAULT 'medium' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_claims_session_id" ON "claims" ("session_id");

-- Step 9: Create claim_sources join table
CREATE TABLE IF NOT EXISTS "claim_sources" (
  "claim_id" uuid NOT NULL REFERENCES "claims"("id") ON DELETE CASCADE,
  "source_id" uuid NOT NULL REFERENCES "sources"("id") ON DELETE CASCADE,
  "excerpt" text
);
CREATE INDEX IF NOT EXISTS "idx_claim_sources_claim_id" ON "claim_sources" ("claim_id");
CREATE INDEX IF NOT EXISTS "idx_claim_sources_source_id" ON "claim_sources" ("source_id");

-- Step 10: Create reviews table (validate mode)
CREATE TABLE IF NOT EXISTS "reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL REFERENCES "sessions"("id") ON DELETE CASCADE,
  "persona_name" text NOT NULL,
  "persona_type" text DEFAULT 'critic' NOT NULL,
  "category" text NOT NULL,
  "content" text NOT NULL,
  "severity" text DEFAULT 'medium' NOT NULL,
  "suggestion" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_reviews_session_id" ON "reviews" ("session_id");

-- Step 11: Create reports table (replaces deliverables for v0.2 mode system)
CREATE TABLE IF NOT EXISTS "reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "session_id" uuid REFERENCES "sessions"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "report_type" text NOT NULL,
  "sections" jsonb NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_reports_workspace_id" ON "reports" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_reports_session_id" ON "reports" ("session_id");

-- Step 12: Create entities table (knowledge)
CREATE TABLE IF NOT EXISTS "entities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "aliases" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_entities_workspace_id" ON "entities" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_entities_name" ON "entities" ("name");

-- Step 13: Create facts table (knowledge)
CREATE TABLE IF NOT EXISTS "facts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "entity_id" uuid NOT NULL REFERENCES "entities"("id") ON DELETE CASCADE,
  "category" text NOT NULL,
  "content" text NOT NULL,
  "numeric_value" text,
  "unit" text,
  "period_label" text,
  "source_report_id" uuid REFERENCES "reports"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_facts_workspace_id" ON "facts" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_facts_entity_id" ON "facts" ("entity_id");

-- Step 14: Create insights table (knowledge)
CREATE TABLE IF NOT EXISTS "insights" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "category" text NOT NULL,
  "content" text NOT NULL,
  "confidence" text DEFAULT 'medium' NOT NULL,
  "source_report_id" uuid REFERENCES "reports"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_insights_workspace_id" ON "insights" ("workspace_id");

-- Step 15: Create entity_insights join table
CREATE TABLE IF NOT EXISTS "entity_insights" (
  "entity_id" uuid NOT NULL REFERENCES "entities"("id") ON DELETE CASCADE,
  "insight_id" uuid NOT NULL REFERENCES "insights"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_entity_insights_entity_id" ON "entity_insights" ("entity_id");
CREATE INDEX IF NOT EXISTS "idx_entity_insights_insight_id" ON "entity_insights" ("insight_id");
