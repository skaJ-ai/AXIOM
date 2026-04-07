import { getDb } from '@/lib/db';
import type { ClaimConfidence, EntityType, FactCategory, InsightCategory } from '@/lib/db/schema';
import { entitiesTable, entityInsightsTable, factsTable, insightsTable } from '@/lib/db/schema';

async function createEntity({
  aliases,
  name,
  type,
  workspaceId,
}: {
  aliases?: string[];
  name: string;
  type: EntityType;
  workspaceId: string;
}): Promise<string> {
  const database = getDb();
  const rows = await database
    .insert(entitiesTable)
    .values({
      aliases: aliases ?? [],
      name,
      type,
      workspaceId,
    })
    .returning({ id: entitiesTable.id });

  const row = rows[0];

  if (!row) {
    throw new Error('엔티티 생성에 실패했습니다.');
  }

  return row.id;
}

async function createFact({
  category,
  content,
  entityId,
  numericValue,
  periodLabel,
  sourceReportId,
  unit,
  workspaceId,
}: {
  category: FactCategory;
  content: string;
  entityId: string;
  numericValue?: string;
  periodLabel?: string;
  sourceReportId?: string;
  unit?: string;
  workspaceId: string;
}): Promise<string> {
  const database = getDb();
  const rows = await database
    .insert(factsTable)
    .values({
      category,
      content,
      entityId,
      numericValue: numericValue ?? null,
      periodLabel: periodLabel ?? null,
      sourceReportId: sourceReportId ?? null,
      unit: unit ?? null,
      workspaceId,
    })
    .returning({ id: factsTable.id });

  const row = rows[0];

  if (!row) {
    throw new Error('팩트 생성에 실패했습니다.');
  }

  return row.id;
}

async function createInsight({
  category,
  confidence,
  content,
  entityIds,
  sourceReportId,
  workspaceId,
}: {
  category: InsightCategory;
  confidence: ClaimConfidence;
  content: string;
  entityIds?: string[];
  sourceReportId?: string;
  workspaceId: string;
}): Promise<string> {
  const database = getDb();

  return database.transaction(async (transaction) => {
    const rows = await transaction
      .insert(insightsTable)
      .values({
        category,
        confidence,
        content,
        sourceReportId: sourceReportId ?? null,
        workspaceId,
      })
      .returning({ id: insightsTable.id });

    const row = rows[0];

    if (!row) {
      throw new Error('인사이트 생성에 실패했습니다.');
    }

    if (entityIds && entityIds.length > 0) {
      const joinValues = entityIds.map((entityId) => ({
        entityId,
        insightId: row.id,
      }));

      await transaction.insert(entityInsightsTable).values(joinValues);
    }

    return row.id;
  });
}

export { createEntity, createFact, createInsight };
