import { and, asc, desc, eq, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { processAssetsTable, promotedAssetsTable, workCardsTable } from '@/lib/db/schema';

import type { PromotedAssetSummary } from './types';

function mapPromotedAssetRow(row: {
  content: string;
  createdAt: Date;
  id: string;
  processAssetId: string;
  processAssetName: string | null;
  scope: string | null;
  sourceIntentId: string;
  sourceSessionId: string | null;
  sourceWorkCardId: string | null;
  sourceWorkCardTitle: string | null;
  type: PromotedAssetSummary['type'];
}): PromotedAssetSummary {
  return {
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    processAssetId: row.processAssetId,
    processAssetName: row.processAssetName,
    scope: row.scope,
    sourceIntentId: row.sourceIntentId,
    sourceSessionId: row.sourceSessionId,
    sourceWorkCardId: row.sourceWorkCardId,
    sourceWorkCardTitle: row.sourceWorkCardTitle,
    type: row.type,
  };
}

async function listPromotedAssetsByProcessAsset(
  processAssetId: string,
  workspaceId: string,
  options?: {
    excludeWorkCardId?: string | null;
    limit?: number;
  },
): Promise<PromotedAssetSummary[]> {
  const database = getDb();
  const rows = await database
    .select({
      content: promotedAssetsTable.content,
      createdAt: promotedAssetsTable.createdAt,
      id: promotedAssetsTable.id,
      processAssetId: promotedAssetsTable.processAssetId,
      processAssetName: processAssetsTable.name,
      scope: promotedAssetsTable.scope,
      sourceIntentId: promotedAssetsTable.sourceIntentId,
      sourceSessionId: promotedAssetsTable.sourceSessionId,
      sourceWorkCardId: promotedAssetsTable.sourceWorkCardId,
      sourceWorkCardTitle: workCardsTable.title,
      type: promotedAssetsTable.type,
    })
    .from(promotedAssetsTable)
    .innerJoin(processAssetsTable, eq(promotedAssetsTable.processAssetId, processAssetsTable.id))
    .leftJoin(workCardsTable, eq(promotedAssetsTable.sourceWorkCardId, workCardsTable.id))
    .where(
      and(
        eq(promotedAssetsTable.workspaceId, workspaceId),
        eq(promotedAssetsTable.processAssetId, processAssetId),
        options?.excludeWorkCardId
          ? sql`${promotedAssetsTable.sourceWorkCardId} is distinct from ${options.excludeWorkCardId}`
          : undefined,
      ),
    )
    .orderBy(desc(promotedAssetsTable.createdAt), asc(promotedAssetsTable.id))
    .limit(options?.limit ?? 8);

  return rows.map(mapPromotedAssetRow);
}

async function listPromotedAssetsByWorkspace(workspaceId: string): Promise<PromotedAssetSummary[]> {
  const database = getDb();
  const rows = await database
    .select({
      content: promotedAssetsTable.content,
      createdAt: promotedAssetsTable.createdAt,
      id: promotedAssetsTable.id,
      processAssetId: promotedAssetsTable.processAssetId,
      processAssetName: processAssetsTable.name,
      scope: promotedAssetsTable.scope,
      sourceIntentId: promotedAssetsTable.sourceIntentId,
      sourceSessionId: promotedAssetsTable.sourceSessionId,
      sourceWorkCardId: promotedAssetsTable.sourceWorkCardId,
      sourceWorkCardTitle: workCardsTable.title,
      type: promotedAssetsTable.type,
    })
    .from(promotedAssetsTable)
    .innerJoin(processAssetsTable, eq(promotedAssetsTable.processAssetId, processAssetsTable.id))
    .leftJoin(workCardsTable, eq(promotedAssetsTable.sourceWorkCardId, workCardsTable.id))
    .where(eq(promotedAssetsTable.workspaceId, workspaceId))
    .orderBy(desc(promotedAssetsTable.createdAt));

  return rows.map(mapPromotedAssetRow);
}

export { listPromotedAssetsByProcessAsset, listPromotedAssetsByWorkspace };
