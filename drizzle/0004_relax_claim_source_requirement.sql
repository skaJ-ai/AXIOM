-- Migration: 0004_relax_claim_source_requirement

ALTER TABLE "claim_sources" ALTER COLUMN "source_id" DROP NOT NULL;
