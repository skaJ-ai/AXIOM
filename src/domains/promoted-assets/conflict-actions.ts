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
  conflictType: 'contradiction' | 'duplication' | 'supersede';
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

const CONTRADICTION_COMPARABLE_TYPES = new Set<DetectablePromotedAsset['type']>([
  'exception',
  'preference',
  'prohibition',
]);

const CONTRADICTION_NEGATIVE_PATTERNS = [
  /금지/iu,
  /배제/iu,
  /불가/iu,
  /비공개/iu,
  /숨겨/iu,
  /제외/iu,
  /지양/iu,
  /하지\s?말/iu,
  /넣지\s?말/iu,
  /노출하지\s?말/iu,
  /빼(?:고|되|줘|주세요)?/iu,
  /미포함/iu,
  /피(?:하|해)/iu,
];

const CONTRADICTION_POSITIVE_PATTERNS = [
  /가능/iu,
  /공개/iu,
  /권장/iu,
  /넣(?:어|으)?/iu,
  /노출/iu,
  /반드시/iu,
  /사용/iu,
  /선호/iu,
  /유지/iu,
  /추가/iu,
  /포함/iu,
  /필수/iu,
  /허용/iu,
];

const CONTRADICTION_STOP_TOKENS = new Set([
  '가이드',
  '기준',
  '내용',
  '느낌',
  '문서',
  '방식',
  '보고',
  '스타일',
  '자료',
  '작성',
  '정리',
  '지침',
  '톤',
  '표현',
  '형식',
]);

const TRAILING_KOREAN_PARTICLE_PATTERN =
  /(까지|부터|처럼|마다|보다|에게|에서|에는|으로|라고|이라|이고|은|는|이|가|을|를|에|의|로|만|도|와|과)$/u;

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

function createConflictGroupingKey(asset: DetectablePromotedAsset, typeKey: string): string {
  const bucketOwnerKey =
    asset.bucketScope === 'personal' ? asset.createdBy?.trim() || asset.id : '__workspace__';
  const scopeKey = normalizeConflictScope(asset.scope) ?? '__none__';

  return `${asset.processAssetId}:${asset.bucketScope}:${bucketOwnerKey}:${typeKey}:${scopeKey}`;
}

function getContradictionPolarity(
  normalizedContent: string,
): 'negative' | 'positive' | null {
  const hasNegative = CONTRADICTION_NEGATIVE_PATTERNS.some((pattern) =>
    pattern.test(normalizedContent),
  );
  const contentWithoutNegativeMarkers = CONTRADICTION_NEGATIVE_PATTERNS.reduce(
    (currentContent, pattern) => currentContent.replace(pattern, ' '),
    normalizedContent,
  );
  const hasPositive = CONTRADICTION_POSITIVE_PATTERNS.some((pattern) =>
    pattern.test(contentWithoutNegativeMarkers),
  );

  if (!hasNegative && !hasPositive) {
    return null;
  }

  if (hasNegative && hasPositive) {
    return null;
  }

  return hasNegative ? 'negative' : 'positive';
}

function normalizeContradictionTopicToken(token: string): string {
  return token.replace(TRAILING_KOREAN_PARTICLE_PATTERN, '').trim();
}

function extractContradictionTopicTokens(normalizedContent: string): string[] {
  let strippedContent = normalizedContent;

  for (const pattern of [...CONTRADICTION_NEGATIVE_PATTERNS, ...CONTRADICTION_POSITIVE_PATTERNS]) {
    strippedContent = strippedContent.replace(pattern, ' ');
  }

  const tokens = strippedContent
    .split(/\s+/)
    .map(normalizeContradictionTopicToken)
    .filter((token) => token.length >= 2 && !CONTRADICTION_STOP_TOKENS.has(token));

  return [...new Set(tokens)];
}

function hasSufficientContradictionTopicOverlap(
  leftTokens: string[],
  rightTokens: string[],
): boolean {
  if (leftTokens.length === 0 || rightTokens.length === 0) {
    return false;
  }

  const rightTokenSet = new Set(rightTokens);
  const sharedTokens = leftTokens.filter((token) => rightTokenSet.has(token));

  if (sharedTokens.length >= 2) {
    return true;
  }

  if (sharedTokens.length === 1) {
    return sharedTokens[0]!.length >= 4;
  }

  const leftJoined = leftTokens.join(' ');
  const rightJoined = rightTokens.join(' ');

  if (leftJoined.length < 8 || rightJoined.length < 8) {
    return false;
  }

  return leftJoined.includes(rightJoined) || rightJoined.includes(leftJoined);
}

function isContradictionComparablePair(
  leftType: DetectablePromotedAsset['type'],
  rightType: DetectablePromotedAsset['type'],
): boolean {
  if (
    !CONTRADICTION_COMPARABLE_TYPES.has(leftType) ||
    !CONTRADICTION_COMPARABLE_TYPES.has(rightType)
  ) {
    return false;
  }

  if (leftType === rightType) {
    return true;
  }

  return (
    (leftType === 'preference' && rightType === 'prohibition') ||
    (leftType === 'prohibition' && rightType === 'preference')
  );
}

function isPotentialContradictionPair(
  leftAsset: DetectablePromotedAsset,
  rightAsset: DetectablePromotedAsset,
  leftNormalizedContent: string,
  rightNormalizedContent: string,
): boolean {
  if (!isContradictionComparablePair(leftAsset.type, rightAsset.type)) {
    return false;
  }

  if (leftNormalizedContent === rightNormalizedContent) {
    return false;
  }

  const leftPolarity = getContradictionPolarity(leftNormalizedContent);
  const rightPolarity = getContradictionPolarity(rightNormalizedContent);

  if (!leftPolarity || !rightPolarity || leftPolarity === rightPolarity) {
    return false;
  }

  const leftTokens = extractContradictionTopicTokens(leftNormalizedContent);
  const rightTokens = extractContradictionTopicTokens(rightNormalizedContent);

  return hasSufficientContradictionTopicOverlap(leftTokens, rightTokens);
}

function createConflictPairKey(candidate: ConflictCandidate): string {
  return `${candidate.conflictType}:${candidate.assetAId}:${candidate.assetBId}`;
}

function createCanonicalConflictCandidate(
  conflictType: ConflictCandidate['conflictType'],
  leftAsset: DetectablePromotedAsset,
  rightAsset: DetectablePromotedAsset,
): ConflictCandidate {
  if (conflictType === 'duplication' || conflictType === 'contradiction') {
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
  const contradictionGroups = new Map<string, DetectablePromotedAsset[]>();

  for (const asset of assets) {
    const groupKey = createConflictGroupingKey(asset, asset.type);
    const currentGroup = groupedAssets.get(groupKey) ?? [];

    currentGroup.push(asset);
    groupedAssets.set(groupKey, currentGroup);

    if (CONTRADICTION_COMPARABLE_TYPES.has(asset.type)) {
      const contradictionTypeKey = asset.type === 'exception' ? 'exception' : 'directive';
      const contradictionGroupKey = createConflictGroupingKey(asset, contradictionTypeKey);
      const currentContradictionGroup = contradictionGroups.get(contradictionGroupKey) ?? [];

      currentContradictionGroup.push(asset);
      contradictionGroups.set(contradictionGroupKey, currentContradictionGroup);
    }
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

  for (const groupAssets of contradictionGroups.values()) {
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

        if (
          !isPotentialContradictionPair(
            leftAsset,
            rightAsset,
            leftNormalizedContent,
            rightNormalizedContent,
          )
        ) {
          continue;
        }

        const candidate = createCanonicalConflictCandidate('contradiction', leftAsset, rightAsset);
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
