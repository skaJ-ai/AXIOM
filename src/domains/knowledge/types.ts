import type { ClaimConfidence, EntityType, FactCategory, InsightCategory } from '@/lib/db/schema';

interface Entity {
  aliases: string[];
  createdAt: string;
  firstSeenAt: string;
  id: string;
  lastSeenAt: string;
  name: string;
  type: EntityType;
  workspaceId: string;
}

interface Fact {
  category: FactCategory;
  content: string;
  createdAt: string;
  entityId: string;
  id: string;
  numericValue: string | null;
  periodLabel: string | null;
  sourceReportId: string | null;
  unit: string | null;
  workspaceId: string;
}

interface Insight {
  category: InsightCategory;
  confidence: ClaimConfidence;
  content: string;
  createdAt: string;
  id: string;
  sourceReportId: string | null;
  workspaceId: string;
}

interface EntityWithFacts extends Entity {
  factCount: number;
  facts: Fact[];
  insightCount: number;
}

export type { Entity, EntityWithFacts, Fact, Insight };
