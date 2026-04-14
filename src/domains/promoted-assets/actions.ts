import { and, eq, inArray } from 'drizzle-orm';

import { syncPromotedAssetConflictsForWorkspace } from '@/domains/promoted-assets/conflict-actions';
import { getDb } from '@/lib/db';
import type { PromotedAssetBucketScope } from '@/lib/db/schema';
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
  bucketScope,
  intentIds,
  workspaceId,
  userId,
}: {
  bucketScope: PromotedAssetBucketScope;
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
        bucketScope,
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

  const promotedIntentIds = createdRows.map((row) => row.sourceIntentId);

  if (promotedIntentIds.length > 0) {
    await syncPromotedAssetConflictsForWorkspace(workspaceId);
  }

  return promotedIntentIds;
}

export { deletePromotedAssetsBySourceIntentIds, promoteApprovedIntentsToAssets };
