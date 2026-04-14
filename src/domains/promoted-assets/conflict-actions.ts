import { and, asc, desc, eq, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import {
  processAssetsTable,
  promotedAssetConflictsTable,
  promotedAssetsTable,
} from '@/lib/db/schema';

type ConflictCandidate = {
  assetAId: string;
  assetBId: string;
  conflictType: 'duplication' | 'supersede';
  processAssetId: string;
  workspaceId: string;
};

type DetectablePromotedAsset = {
  bucketScope: 'personal' | 'workspace';
  content: string;
  createdBy: string | null;
  createdAt: Date;
  id: string;
  processAssetId: string;
  scope: string | null;
  sourceWorkCardId: string | null;
  type: 'audience' | 'context' | 'exception' | 'judgment_basis' | 'preference' | 'prohibition';
  workspaceId: string;
};

function normalizeConflictScope(scope: string | null): string | null {
  if (typeof scope !== 'string') {
    return null;
  }

  const normalizedScope = scope.trim();
  return normalizedScope.length > 0 ? normalizedScope : null;
}

function normalizePromotedAssetContent(content: string): string {
  return content
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createConflictPairKey(candidate: ConflictCandidate): string {
  return `${candidate.conflictType}:${candidate.assetAId}:${candidate.assetBId}`;
}

function createCanonicalConflictCandidate(
  conflictType: ConflictCandidate['conflictType'],
  leftAsset: DetectablePromotedAsset,
  rightAsset: DetectablePromotedAsset,
): ConflictCandidate {
  if (conflictType === 'duplication') {
    const [assetAId, assetBId] =
      leftAsset.id < rightAsset.id ? [leftAsset.id, rightAsset.id] : [rightAsset.id, leftAsset.id];

    return {
      assetAId,
      assetBId,
      conflictType,
      processAssetId: leftAsset.processAssetId,
      workspaceId: leftAsset.workspaceId,
    };
  }

  const [olderAsset, newerAsset] =
    leftAsset.createdAt <= rightAsset.createdAt ? [leftAsset, rightAsset] : [rightAsset, leftAsset];

  return {
    assetAId: olderAsset.id,
    assetBId: newerAsset.id,
    conflictType,
    processAssetId: olderAsset.processAssetId,
    workspaceId: olderAsset.workspaceId,
  };
}

function isPotentialSupersedePair(
  leftNormalizedContent: string,
  rightNormalizedContent: string,
): boolean {
  if (
    leftNormalizedContent.length < 16 ||
    rightNormalizedContent.length < 16 ||
    leftNormalizedContent === rightNormalizedContent
  ) {
    return false;
  }

  const [shorterContent, longerContent] =
    leftNormalizedContent.length <= rightNormalizedContent.length
      ? [leftNormalizedContent, rightNormalizedContent]
      : [rightNormalizedContent, leftNormalizedContent];

  if (!longerContent.includes(shorterContent)) {
    return false;
  }

  return longerContent.length - shorterContent.length >= 12;
}

function detectConflictCandidates(assets: DetectablePromotedAsset[]): ConflictCandidate[] {
  const groupedAssets = new Map<string, DetectablePromotedAsset[]>();

  for (const asset of assets) {
    const bucketOwnerKey =
      asset.bucketScope === 'personal' ? asset.createdBy?.trim() || asset.id : '__workspace__';
    const scopeKey = normalizeConflictScope(asset.scope) ?? '__none__';
    const groupKey = `${asset.processAssetId}:${asset.bucketScope}:${bucketOwnerKey}:${asset.type}:${scopeKey}`;
    const currentGroup = groupedAssets.get(groupKey) ?? [];

    currentGroup.push(asset);
    groupedAssets.set(groupKey, currentGroup);
  }

  const candidates = new Map<string, ConflictCandidate>();

  for (const groupAssets of groupedAssets.values()) {
    if (groupAssets.length < 2) {
      continue;
    }

    const sortedAssets = [...groupAssets].sort((leftAsset, rightAsset) => {
      const createdAtCompare = leftAsset.createdAt.getTime() - rightAsset.createdAt.getTime();

      if (createdAtCompare !== 0) {
        return createdAtCompare;
      }

      return leftAsset.id.localeCompare(rightAsset.id);
    });

    for (let leftIndex = 0; leftIndex < sortedAssets.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < sortedAssets.length; rightIndex += 1) {
        const leftAsset = sortedAssets[leftIndex];
        const rightAsset = sortedAssets[rightIndex];

        if (!leftAsset || !rightAsset) {
          continue;
        }

        const leftNormalizedContent = normalizePromotedAssetContent(leftAsset.content);
        const rightNormalizedContent = normalizePromotedAssetContent(rightAsset.content);

        if (leftNormalizedContent.length === 0 || rightNormalizedContent.length === 0) {
          continue;
        }

        const candidate =
          leftNormalizedContent === rightNormalizedContent
            ? createCanonicalConflictCandidate('duplication', leftAsset, rightAsset)
            : isPotentialSupersedePair(leftNormalizedContent, rightNormalizedContent)
              ? createCanonicalConflictCandidate('supersede', leftAsset, rightAsset)
              : null;

        if (!candidate) {
          continue;
        }

        candidates.set(createConflictPairKey(candidate), candidate);
      }
    }
  }

  return [...candidates.values()];
}

async function syncPromotedAssetConflictsForWorkspace(workspaceId: string): Promise<string[]> {
  const database = getDb();
  const assetRows = await database
    .select({
      bucketScope: promotedAssetsTable.bucketScope,
      content: promotedAssetsTable.content,
      createdBy: promotedAssetsTable.createdBy,
      createdAt: promotedAssetsTable.createdAt,
      id: promotedAssetsTable.id,
      processAssetId: promotedAssetsTable.processAssetId,
      scope: promotedAssetsTable.scope,
      sourceWorkCardId: promotedAssetsTable.sourceWorkCardId,
      type: promotedAssetsTable.type,
      workspaceId: promotedAssetsTable.workspaceId,
    })
    .from(promotedAssetsTable)
    .innerJoin(processAssetsTable, eq(promotedAssetsTable.processAssetId, processAssetsTable.id))
    .where(
      and(
        eq(promotedAssetsTable.workspaceId, workspaceId),
        eq(promotedAssetsTable.status, 'active'),
      ),
    )
    .orderBy(desc(promotedAssetsTable.createdAt), asc(promotedAssetsTable.id));

  const candidates = detectConflictCandidates(assetRows);

  if (candidates.length === 0) {
    return [];
  }

  const createdRows = await database
    .insert(promotedAssetConflictsTable)
    .values(
      candidates.map((candidate) => ({
        assetAId: candidate.assetAId,
        assetBId: candidate.assetBId,
        conflictType: candidate.conflictType,
        processAssetId: candidate.processAssetId,
        workspaceId: candidate.workspaceId,
      })),
    )
    .onConflictDoNothing({
      target: [
        promotedAssetConflictsTable.assetAId,
        promotedAssetConflictsTable.assetBId,
        promotedAssetConflictsTable.conflictType,
      ],
    })
    .returning({
      id: promotedAssetConflictsTable.id,
    });

  return createdRows.map((row) => row.id);
}

async function resolvePromotedAssetConflict({
  conflictId,
  resolutionType,
  reviewerId,
  workspaceId,
}: {
  conflictId: string;
  resolutionType: 'accept_both' | 'archive_a' | 'archive_b';
  reviewerId: string;
  workspaceId: string;
}): Promise<boolean> {
  const database = getDb();
  const conflictRows = await database
    .select({
      assetAId: promotedAssetConflictsTable.assetAId,
      assetBId: promotedAssetConflictsTable.assetBId,
      id: promotedAssetConflictsTable.id,
      status: promotedAssetConflictsTable.status,
    })
    .from(promotedAssetConflictsTable)
    .where(
      and(
        eq(promotedAssetConflictsTable.id, conflictId),
        eq(promotedAssetConflictsTable.workspaceId, workspaceId),
      ),
    )
    .limit(1);
  const currentConflict = conflictRows[0];

  if (!currentConflict) {
    return false;
  }

  if (currentConflict.status === 'resolved') {
    return true;
  }

  await database.transaction(async (transaction) => {
    if (resolutionType === 'accept_both') {
      await transaction
        .update(promotedAssetConflictsTable)
        .set({
          resolutionType,
          resolvedAt: sql`now()`,
          resolvedBy: reviewerId,
          status: 'resolved',
        })
        .where(
          and(
            eq(promotedAssetConflictsTable.id, conflictId),
            eq(promotedAssetConflictsTable.workspaceId, workspaceId),
            eq(promotedAssetConflictsTable.status, 'detected'),
          ),
        );
      return;
    }

    const archivedAssetId =
      resolutionType === 'archive_a' ? currentConflict.assetAId : currentConflict.assetBId;

    await transaction
      .update(promotedAssetsTable)
      .set({
        status: 'archived',
      })
      .where(
        and(
          eq(promotedAssetsTable.id, archivedAssetId),
          eq(promotedAssetsTable.workspaceId, workspaceId),
          eq(promotedAssetsTable.status, 'active'),
        ),
      );

    await transaction
      .update(promotedAssetConflictsTable)
      .set({
        resolutionType: 'archive_a',
        resolvedAt: sql`now()`,
        resolvedBy: reviewerId,
        status: 'resolved',
      })
      .where(
        and(
          eq(promotedAssetConflictsTable.workspaceId, workspaceId),
          eq(promotedAssetConflictsTable.status, 'detected'),
          eq(promotedAssetConflictsTable.assetAId, archivedAssetId),
        ),
      );

    await transaction
      .update(promotedAssetConflictsTable)
      .set({
        resolutionType: 'archive_b',
        resolvedAt: sql`now()`,
        resolvedBy: reviewerId,
        status: 'resolved',
      })
      .where(
        and(
          eq(promotedAssetConflictsTable.workspaceId, workspaceId),
          eq(promotedAssetConflictsTable.status, 'detected'),
          eq(promotedAssetConflictsTable.assetBId, archivedAssetId),
        ),
      );
  });

  return true;
}

export { resolvePromotedAssetConflict, syncPromotedAssetConflictsForWorkspace };
