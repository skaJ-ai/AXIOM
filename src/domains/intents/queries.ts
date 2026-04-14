import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import {
  intentFragmentsTable,
  processAssetsTable,
  promotedAssetsTable,
  sessionsTable,
  workCardsTable,
} from '@/lib/db/schema';

import type { IntentFragment, IntentReviewItem } from './types';

async function listIntentFragmentsBySession(
  sessionId: string,
  workspaceId: string,
): Promise<IntentFragment[]> {
  const database = getDb();
  const rows = await database
    .select({
      confidence: intentFragmentsTable.confidence,
      content: intentFragmentsTable.content,
      createdAt: intentFragmentsTable.createdAt,
      id: intentFragmentsTable.id,
      reviewStatus: intentFragmentsTable.reviewStatus,
      scope: intentFragmentsTable.scope,
      speaker: intentFragmentsTable.speaker,
      type: intentFragmentsTable.type,
    })
    .from(intentFragmentsTable)
    .where(
      and(
        eq(intentFragmentsTable.sessionId, sessionId),
        eq(intentFragmentsTable.workspaceId, workspaceId),
        sql`${intentFragmentsTable.reviewStatus} <> 'rejected'`,
      ),
    )
    .orderBy(desc(intentFragmentsTable.createdAt));

  return rows.map((row) => ({
    confidence: row.confidence,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    reviewStatus: row.reviewStatus,
    scope: row.scope,
    speaker: row.speaker,
    type: row.type,
  }));
}

async function listIntentReviewQueueByWorkspace(
  workspaceId: string,
  options?: {
    statuses?: IntentReviewItem['reviewStatus'][];
  },
): Promise<IntentReviewItem[]> {
  const database = getDb();
  const statusFilter =
    options?.statuses && options.statuses.length > 0
      ? inArray(intentFragmentsTable.reviewStatus, options.statuses)
      : undefined;
  const rows = await database
    .select({
      confidence: intentFragmentsTable.confidence,
      content: intentFragmentsTable.content,
      createdAt: intentFragmentsTable.createdAt,
      id: intentFragmentsTable.id,
      promotedAssetId: sql<IntentReviewItem['promotedAssetId']>`(
        select ${promotedAssetsTable.id}
        from ${promotedAssetsTable}
        where ${promotedAssetsTable.sourceIntentId} = ${intentFragmentsTable.id}
          and ${promotedAssetsTable.status} = 'active'
        limit 1
      )`,
      promotedAssetMaturity: sql<IntentReviewItem['promotedAssetMaturity']>`(
        select ${promotedAssetsTable.maturity}
        from ${promotedAssetsTable}
        where ${promotedAssetsTable.sourceIntentId} = ${intentFragmentsTable.id}
          and ${promotedAssetsTable.status} = 'active'
        limit 1
      )`,
      isPromoted: sql<boolean>`exists(
        select 1
        from ${promotedAssetsTable}
        where ${promotedAssetsTable.sourceIntentId} = ${intentFragmentsTable.id}
          and ${promotedAssetsTable.status} = 'active'
      )`,
      processAssetId: workCardsTable.processAssetId,
      processAssetName: processAssetsTable.name,
      promotedBucketScope: sql<IntentReviewItem['promotedBucketScope']>`(
        select ${promotedAssetsTable.bucketScope}
        from ${promotedAssetsTable}
        where ${promotedAssetsTable.sourceIntentId} = ${intentFragmentsTable.id}
          and ${promotedAssetsTable.status} = 'active'
        limit 1
      )`,
      reviewStatus: intentFragmentsTable.reviewStatus,
      scope: intentFragmentsTable.scope,
      sessionId: intentFragmentsTable.sessionId,
      sessionTitle: sessionsTable.title,
      speaker: intentFragmentsTable.speaker,
      type: intentFragmentsTable.type,
      workCardId: intentFragmentsTable.workCardId,
      workCardTitle: workCardsTable.title,
    })
    .from(intentFragmentsTable)
    .innerJoin(sessionsTable, eq(intentFragmentsTable.sessionId, sessionsTable.id))
    .leftJoin(workCardsTable, eq(intentFragmentsTable.workCardId, workCardsTable.id))
    .leftJoin(processAssetsTable, eq(workCardsTable.processAssetId, processAssetsTable.id))
    .where(and(eq(intentFragmentsTable.workspaceId, workspaceId), statusFilter))
    .orderBy(
      sql`case ${intentFragmentsTable.reviewStatus}
        when 'nominated' then 0
        when 'captured' then 1
        when 'rejected' then 2
        when 'approved' then 3
        else 9
      end`,
      desc(intentFragmentsTable.createdAt),
    );

  return rows.map((row) => ({
    confidence: row.confidence,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    isPromoted: row.isPromoted,
    processAssetId: row.processAssetId,
    processAssetName: row.processAssetName,
    promotedAssetId: row.promotedAssetId,
    promotedAssetMaturity: row.promotedAssetMaturity,
    promotedBucketScope: row.promotedBucketScope,
    reviewStatus: row.reviewStatus,
    scope: row.scope,
    sessionId: row.sessionId,
    sessionTitle: row.sessionTitle ?? '제목 없는 세션',
    speaker: row.speaker,
    type: row.type,
    workCardId: row.workCardId,
    workCardTitle: row.workCardTitle,
  }));
}

async function listApprovedIntentFragmentsByWorkspaceGroupedByWorkCard(
  workspaceId: string,
): Promise<
  {
    content: string;
    createdAt: string;
    id: string;
    reviewStatus: IntentFragment['reviewStatus'];
    sessionId: string;
    sessionTitle: string;
    type: IntentFragment['type'];
    workCardId: string;
  }[]
> {
  const database = getDb();
  const rows = await database
    .select({
      content: intentFragmentsTable.content,
      createdAt: intentFragmentsTable.createdAt,
      id: intentFragmentsTable.id,
      reviewStatus: intentFragmentsTable.reviewStatus,
      sessionId: intentFragmentsTable.sessionId,
      sessionTitle: sessionsTable.title,
      type: intentFragmentsTable.type,
      workCardId: intentFragmentsTable.workCardId,
    })
    .from(intentFragmentsTable)
    .innerJoin(sessionsTable, eq(intentFragmentsTable.sessionId, sessionsTable.id))
    .where(
      and(
        eq(intentFragmentsTable.workspaceId, workspaceId),
        eq(intentFragmentsTable.reviewStatus, 'approved'),
        sql`${intentFragmentsTable.workCardId} is not null`,
      ),
    )
    .orderBy(desc(intentFragmentsTable.createdAt));

  return rows.map((row) => ({
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    reviewStatus: row.reviewStatus,
    sessionId: row.sessionId,
    sessionTitle: row.sessionTitle ?? '제목 없는 세션',
    type: row.type,
    workCardId: row.workCardId!,
  }));
}

export {
  listApprovedIntentFragmentsByWorkspaceGroupedByWorkCard,
  listIntentFragmentsBySession,
  listIntentReviewQueueByWorkspace,
};
