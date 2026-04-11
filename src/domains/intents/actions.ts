import { and, eq, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { intentFragmentsTable } from '@/lib/db/schema';

import { extractIntentFragmentsFromText } from './extraction';

import type { IntentFragmentDraft } from './types';

type IntentReviewDecision = 'approve' | 'reject' | 'reset';

async function createIntentFragments({
  fragments,
  messageId,
  sessionId,
  workCardId,
  workspaceId,
}: {
  fragments: IntentFragmentDraft[];
  messageId?: string | null;
  sessionId: string;
  workCardId?: string | null;
  workspaceId: string;
}): Promise<void> {
  if (fragments.length === 0) {
    return;
  }

  const database = getDb();
  await database.insert(intentFragmentsTable).values(
    fragments.map((fragment) => ({
      confidence: fragment.confidence ?? 'medium',
      content: fragment.content,
      messageId: messageId ?? null,
      reviewStatus: 'captured' as const,
      scope: fragment.scope ?? null,
      sessionId,
      speaker: fragment.speaker ?? 'user',
      type: fragment.type,
      workCardId: workCardId ?? null,
      workspaceId,
    })),
  );
}

async function nominateIntentFragment(id: string, workspaceId: string): Promise<boolean> {
  const database = getDb();
  const updatedRows = await database
    .update(intentFragmentsTable)
    .set({
      promoted: true,
      promotedAt: sql`coalesce(${intentFragmentsTable.promotedAt}, now())`,
      reviewStatus: 'nominated',
      reviewedAt: null,
      reviewedBy: null,
    })
    .where(and(eq(intentFragmentsTable.id, id), eq(intentFragmentsTable.workspaceId, workspaceId)))
    .returning({ id: intentFragmentsTable.id });

  return updatedRows.length > 0;
}

async function reviewIntentFragment({
  decision,
  intentId,
  reviewerId,
  workspaceId,
}: {
  decision: IntentReviewDecision;
  intentId: string;
  reviewerId: string;
  workspaceId: string;
}): Promise<boolean> {
  const database = getDb();
  const nextValues =
    decision === 'approve'
      ? {
          promoted: true,
          promotedAt: sql`coalesce(${intentFragmentsTable.promotedAt}, now())`,
          reviewStatus: 'approved' as const,
          reviewedAt: sql`now()`,
          reviewedBy: reviewerId,
        }
      : decision === 'reject'
        ? {
            promoted: false,
            promotedAt: null,
            reviewStatus: 'rejected' as const,
            reviewedAt: sql`now()`,
            reviewedBy: reviewerId,
          }
        : {
            promoted: false,
            promotedAt: null,
            reviewStatus: 'captured' as const,
            reviewedAt: null,
            reviewedBy: null,
          };

  const updatedRows = await database
    .update(intentFragmentsTable)
    .set(nextValues)
    .where(
      and(eq(intentFragmentsTable.id, intentId), eq(intentFragmentsTable.workspaceId, workspaceId)),
    )
    .returning({ id: intentFragmentsTable.id });

  return updatedRows.length > 0;
}

async function captureIntentFragmentsForSessionMessage({
  content,
  messageId,
  sessionId,
  workCardId,
  workspaceId,
}: {
  content: string;
  messageId?: string | null;
  sessionId: string;
  workCardId?: string | null;
  workspaceId: string;
}): Promise<void> {
  const fragments = extractIntentFragmentsFromText(content);

  if (fragments.length === 0) {
    return;
  }

  await createIntentFragments({
    fragments,
    messageId: messageId ?? null,
    sessionId,
    workCardId: workCardId ?? null,
    workspaceId,
  });
}

const promoteIntentFragment = nominateIntentFragment;

export {
  captureIntentFragmentsForSessionMessage,
  createIntentFragments,
  nominateIntentFragment,
  promoteIntentFragment,
  reviewIntentFragment,
};
export type { IntentReviewDecision };
