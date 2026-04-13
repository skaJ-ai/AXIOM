import { and, eq, inArray } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { intentFragmentsTable, promotedAssetsTable, workCardsTable } from '@/lib/db/schema';

async function deletePromotedAssetsBySourceIntentIds(
  intentIds: string[],
  workspaceId: string,
): Promise<void> {
  const uniqueIntentIds = Array.from(new Set(intentIds.map((id) => id.trim()).filter(Boolean)));

  if (uniqueIntentIds.length === 0) {
    return;
  }

  const database = getDb();
  await database
    .delete(promotedAssetsTable)
    .where(
      and(
        eq(promotedAssetsTable.workspaceId, workspaceId),
        inArray(promotedAssetsTable.sourceIntentId, uniqueIntentIds),
      ),
    );
}

async function promoteApprovedIntentsToAssets({
  intentIds,
  workspaceId,
  userId,
}: {
  intentIds: string[];
  userId: string;
  workspaceId: string;
}): Promise<string[]> {
  const uniqueIntentIds = Array.from(new Set(intentIds.map((id) => id.trim()).filter(Boolean)));

  if (uniqueIntentIds.length === 0) {
    return [];
  }

  const database = getDb();
  const intentRows = await database
    .select({
      content: intentFragmentsTable.content,
      id: intentFragmentsTable.id,
      processAssetId: workCardsTable.processAssetId,
      reviewStatus: intentFragmentsTable.reviewStatus,
      scope: intentFragmentsTable.scope,
      sessionId: intentFragmentsTable.sessionId,
      sourceSensitivity: workCardsTable.sensitivity,
      type: intentFragmentsTable.type,
      workCardId: intentFragmentsTable.workCardId,
    })
    .from(intentFragmentsTable)
    .leftJoin(workCardsTable, eq(intentFragmentsTable.workCardId, workCardsTable.id))
    .where(
      and(
        eq(intentFragmentsTable.workspaceId, workspaceId),
        inArray(intentFragmentsTable.id, uniqueIntentIds),
      ),
    );

  if (intentRows.length === 0) {
    return [];
  }

  const existingRows = await database
    .select({
      sourceIntentId: promotedAssetsTable.sourceIntentId,
    })
    .from(promotedAssetsTable)
    .where(
      and(
        eq(promotedAssetsTable.workspaceId, workspaceId),
        inArray(promotedAssetsTable.sourceIntentId, uniqueIntentIds),
      ),
    );
  const existingIntentIdSet = new Set(existingRows.map((row) => row.sourceIntentId));
  const nextRows = intentRows.filter(
    (row) =>
      row.reviewStatus === 'approved' &&
      typeof row.processAssetId === 'string' &&
      row.processAssetId.length > 0 &&
      !existingIntentIdSet.has(row.id),
  );

  if (nextRows.length === 0) {
    return [];
  }

  const createdRows = await database
    .insert(promotedAssetsTable)
    .values(
      nextRows.map((row) => ({
        content: row.content,
        createdBy: userId,
        processAssetId: row.processAssetId!,
        scope: row.scope ?? null,
        sourceIntentId: row.id,
        sourceSensitivity: row.sourceSensitivity ?? 'general',
        sourceSessionId: row.sessionId,
        sourceWorkCardId: row.workCardId ?? null,
        type: row.type,
        workspaceId,
      })),
    )
    .onConflictDoNothing({
      target: promotedAssetsTable.sourceIntentId,
    })
    .returning({
      sourceIntentId: promotedAssetsTable.sourceIntentId,
    });

  return createdRows.map((row) => row.sourceIntentId);
}

export { deletePromotedAssetsBySourceIntentIds, promoteApprovedIntentsToAssets };
