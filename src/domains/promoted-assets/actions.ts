import { and, eq, inArray, sql } from 'drizzle-orm';

import { syncPromotedAssetConflictsForWorkspace } from '@/domains/promoted-assets/conflict-actions';
import { getDb } from '@/lib/db';
import type { PromotedAssetBucketScope, PromotedAssetMaturity } from '@/lib/db/schema';
import { intentFragmentsTable, promotedAssetsTable, workCardsTable } from '@/lib/db/schema';

import { createPromotedAssetBucketVisibilityFilter } from './visibility';

import type {
  PromotedAssetMaturityUpdateSummary,
  PromotedAssetMutationSummary,
} from './types';

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
}): Promise<PromotedAssetMutationSummary[]> {
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
      bucketScope: promotedAssetsTable.bucketScope,
      id: promotedAssetsTable.id,
      maturity: promotedAssetsTable.maturity,
      sourceIntentId: promotedAssetsTable.sourceIntentId,
    });

  const promotedIntentIds = createdRows.map((row) => row.sourceIntentId);

  if (promotedIntentIds.length > 0) {
    await syncPromotedAssetConflictsForWorkspace(workspaceId);
  }

  return createdRows;
}

async function updatePromotedAssetMaturityBatch({
  assetIds,
  maturity,
  userId,
  workspaceId,
}: {
  assetIds: string[];
  maturity: PromotedAssetMaturity;
  userId: string;
  workspaceId: string;
}): Promise<PromotedAssetMaturityUpdateSummary[]> {
  const uniqueAssetIds = Array.from(new Set(assetIds.map((id) => id.trim()).filter(Boolean)));

  if (uniqueAssetIds.length === 0) {
    return [];
  }

  const database = getDb();
  const updatedRows = await database
    .update(promotedAssetsTable)
    .set(
      maturity === 'verified_standard'
        ? {
            maturity,
            verifiedAt: sql`now()`,
            verifiedBy: userId,
          }
        : {
            maturity,
            verifiedAt: null,
            verifiedBy: null,
          },
    )
    .where(
      and(
        eq(promotedAssetsTable.workspaceId, workspaceId),
        inArray(promotedAssetsTable.id, uniqueAssetIds),
        eq(promotedAssetsTable.status, 'active'),
        createPromotedAssetBucketVisibilityFilter(userId),
        maturity === 'verified_standard'
          ? eq(promotedAssetsTable.bucketScope, 'workspace')
          : undefined,
        maturity === 'verified_standard'
          ? eq(promotedAssetsTable.maturity, 'promoted')
          : eq(promotedAssetsTable.maturity, 'verified_standard'),
      ),
    )
    .returning({
      id: promotedAssetsTable.id,
      maturity: promotedAssetsTable.maturity,
    });

  return updatedRows;
}

export {
  deletePromotedAssetsBySourceIntentIds,
  promoteApprovedIntentsToAssets,
  updatePromotedAssetMaturityBatch,
};
