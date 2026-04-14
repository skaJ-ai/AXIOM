import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';

import { inferIntentScopesFromTexts } from '@/domains/intents/scope';
import { getDb } from '@/lib/db';
import type {
  PromotedAssetBucketScope,
  PromotedAssetMaturity,
  WorkCardSensitivity,
} from '@/lib/db/schema';
import { processAssetsTable, promotedAssetsTable, workCardsTable } from '@/lib/db/schema';

import { createPromotedAssetBucketVisibilityFilter } from './visibility';

import type { PromotedAssetSummary } from './types';

function getAllowedPromotedAssetSensitivities(
  currentSensitivity?: WorkCardSensitivity | null,
): WorkCardSensitivity[] | null {
  switch (currentSensitivity) {
    case 'confidential':
      return ['general', 'restricted', 'confidential'];
    case 'restricted':
      return ['general', 'restricted'];
    case 'general':
      return ['general'];
    default:
      return null;
  }
}

function mapPromotedAssetRow(row: {
  bucketScope: PromotedAssetBucketScope;
  content: string;
  createdAt: Date;
  id: string;
  maturity: PromotedAssetMaturity;
  processAssetId: string;
  processAssetName: string | null;
  scope: string | null;
  sourceIntentId: string;
  sourceSensitivity: WorkCardSensitivity;
  sourceSessionId: string | null;
  sourceWorkCardId: string | null;
  sourceWorkCardTitle: string | null;
  type: PromotedAssetSummary['type'];
  verifiedAt: Date | null;
}): PromotedAssetSummary {
  return {
    bucketScope: row.bucketScope,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    maturity: row.maturity,
    processAssetId: row.processAssetId,
    processAssetName: row.processAssetName,
    scope: row.scope,
    sourceIntentId: row.sourceIntentId,
    sourceSensitivity: row.sourceSensitivity,
    sourceSessionId: row.sourceSessionId,
    sourceWorkCardId: row.sourceWorkCardId,
    sourceWorkCardTitle: row.sourceWorkCardTitle,
    type: row.type,
    verifiedAt: row.verifiedAt ? row.verifiedAt.toISOString() : null,
  };
}

function matchesCurrentScope(
  assetScope: string | null,
  currentScopes: string[] | null | undefined,
): boolean {
  if (typeof assetScope !== 'string' || assetScope.trim().length === 0) {
    return true;
  }

  if (!currentScopes || currentScopes.length === 0) {
    return true;
  }

  return currentScopes.includes(assetScope.trim());
}

async function listPromotedAssetsByProcessAsset(
  processAssetId: string,
  workspaceId: string,
  options?: {
    currentScopeHints?: Array<string | null | undefined>;
    currentSensitivity?: WorkCardSensitivity | null;
    currentUserId?: string;
    excludeWorkCardId?: string | null;
    limit?: number;
  },
): Promise<PromotedAssetSummary[]> {
  const database = getDb();
  const allowedSensitivities = getAllowedPromotedAssetSensitivities(options?.currentSensitivity);
  const currentScopes = inferIntentScopesFromTexts(options?.currentScopeHints ?? []);
  const queryLimit =
    currentScopes.length > 0 ? Math.max((options?.limit ?? 8) * 4, 16) : (options?.limit ?? 8);
  const rows = await database
    .select({
      bucketScope: promotedAssetsTable.bucketScope,
      content: promotedAssetsTable.content,
      createdAt: promotedAssetsTable.createdAt,
      id: promotedAssetsTable.id,
      maturity: promotedAssetsTable.maturity,
      processAssetId: promotedAssetsTable.processAssetId,
      processAssetName: processAssetsTable.name,
      scope: promotedAssetsTable.scope,
      sourceIntentId: promotedAssetsTable.sourceIntentId,
      sourceSensitivity: promotedAssetsTable.sourceSensitivity,
      sourceSessionId: promotedAssetsTable.sourceSessionId,
      sourceWorkCardId: promotedAssetsTable.sourceWorkCardId,
      sourceWorkCardTitle: workCardsTable.title,
      type: promotedAssetsTable.type,
      verifiedAt: promotedAssetsTable.verifiedAt,
    })
    .from(promotedAssetsTable)
    .innerJoin(processAssetsTable, eq(promotedAssetsTable.processAssetId, processAssetsTable.id))
    .leftJoin(workCardsTable, eq(promotedAssetsTable.sourceWorkCardId, workCardsTable.id))
    .where(
      and(
        eq(promotedAssetsTable.workspaceId, workspaceId),
        eq(promotedAssetsTable.processAssetId, processAssetId),
        eq(promotedAssetsTable.status, 'active'),
        createPromotedAssetBucketVisibilityFilter(options?.currentUserId),
        allowedSensitivities
          ? inArray(promotedAssetsTable.sourceSensitivity, allowedSensitivities)
          : undefined,
        options?.excludeWorkCardId
          ? sql`${promotedAssetsTable.sourceWorkCardId} is distinct from ${options.excludeWorkCardId}`
          : undefined,
      ),
    )
    .orderBy(
      sql`case ${promotedAssetsTable.maturity}
        when 'verified_standard' then 0
        else 1
      end`,
      desc(promotedAssetsTable.createdAt),
      asc(promotedAssetsTable.id),
    )
    .limit(queryLimit);

  return rows
    .filter((row) => matchesCurrentScope(row.scope, currentScopes))
    .slice(0, options?.limit ?? 8)
    .map(mapPromotedAssetRow);
}

async function listPromotedAssetsByWorkspace(
  workspaceId: string,
  currentUserId?: string,
): Promise<PromotedAssetSummary[]> {
  const database = getDb();
  const rows = await database
    .select({
      bucketScope: promotedAssetsTable.bucketScope,
      content: promotedAssetsTable.content,
      createdAt: promotedAssetsTable.createdAt,
      id: promotedAssetsTable.id,
      maturity: promotedAssetsTable.maturity,
      processAssetId: promotedAssetsTable.processAssetId,
      processAssetName: processAssetsTable.name,
      scope: promotedAssetsTable.scope,
      sourceIntentId: promotedAssetsTable.sourceIntentId,
      sourceSensitivity: promotedAssetsTable.sourceSensitivity,
      sourceSessionId: promotedAssetsTable.sourceSessionId,
      sourceWorkCardId: promotedAssetsTable.sourceWorkCardId,
      sourceWorkCardTitle: workCardsTable.title,
      type: promotedAssetsTable.type,
      verifiedAt: promotedAssetsTable.verifiedAt,
    })
    .from(promotedAssetsTable)
    .innerJoin(processAssetsTable, eq(promotedAssetsTable.processAssetId, processAssetsTable.id))
    .leftJoin(workCardsTable, eq(promotedAssetsTable.sourceWorkCardId, workCardsTable.id))
    .where(
      and(
        eq(promotedAssetsTable.workspaceId, workspaceId),
        eq(promotedAssetsTable.status, 'active'),
        createPromotedAssetBucketVisibilityFilter(currentUserId),
      ),
    )
    .orderBy(
      sql`case ${promotedAssetsTable.maturity}
        when 'verified_standard' then 0
        else 1
      end`,
      desc(promotedAssetsTable.createdAt),
    );

  return rows.map(mapPromotedAssetRow);
}

export { listPromotedAssetsByProcessAsset, listPromotedAssetsByWorkspace };
