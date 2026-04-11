import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { intentFragmentsTable, sessionsTable, workCardsTable } from '@/lib/db/schema';

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
      promoted: intentFragmentsTable.promoted,
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
      ),
    )
    .orderBy(desc(intentFragmentsTable.createdAt));

  return rows.map((row) => ({
    confidence: row.confidence,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    promoted: row.promoted,
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
      promoted: intentFragmentsTable.promoted,
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
    promoted: row.promoted,
    reviewStatus: row.reviewStatus,
    scope: row.scope,
    sessionId: row.sessionId,
    sessionTitle: row.sessionTitle ?? 'Untitled session',
    speaker: row.speaker,
    type: row.type,
    workCardId: row.workCardId,
    workCardTitle: row.workCardTitle,
  }));
}

export { listIntentFragmentsBySession, listIntentReviewQueueByWorkspace };
