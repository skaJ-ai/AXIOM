import { and, eq, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { intentFragmentsTable } from '@/lib/db/schema';

import { extractIntentFragmentsFromText } from './extraction';

import type { IntentFragmentDraft } from './types';

type IntentReviewDecision = 'approve' | 'reject' | 'reset';

function getIntentTransitionErrorMessage(
  decision: IntentReviewDecision | 'nominate',
  currentStatus: 'approved' | 'captured' | 'nominated' | 'rejected',
): string {
  if (decision === 'nominate') {
    return `Intent는 ${currentStatus} 상태에서 nominated로 바꿀 수 없습니다.`;
  }

  if (decision === 'reset') {
    return `Intent는 ${currentStatus} 상태에서 captured로 되돌릴 수 없습니다.`;
  }

  return `Intent ${decision}는 nominated 상태에서만 가능합니다.`;
}

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
  const currentRows = await database
    .select({ reviewStatus: intentFragmentsTable.reviewStatus })
    .from(intentFragmentsTable)
    .where(and(eq(intentFragmentsTable.id, id), eq(intentFragmentsTable.workspaceId, workspaceId)))
    .limit(1);
  const currentIntent = currentRows[0];

  if (!currentIntent) {
    return false;
  }

  if (currentIntent.reviewStatus === 'nominated') {
    return true;
  }

  if (currentIntent.reviewStatus !== 'captured') {
    throw new Error(getIntentTransitionErrorMessage('nominate', currentIntent.reviewStatus));
  }

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
  const currentRows = await database
    .select({ reviewStatus: intentFragmentsTable.reviewStatus })
    .from(intentFragmentsTable)
    .where(
      and(eq(intentFragmentsTable.id, intentId), eq(intentFragmentsTable.workspaceId, workspaceId)),
    )
    .limit(1);
  const currentIntent = currentRows[0];

  if (!currentIntent) {
    return false;
  }

  if (decision === 'approve') {
    if (currentIntent.reviewStatus === 'approved') {
      return true;
    }

    if (currentIntent.reviewStatus !== 'nominated') {
      throw new Error(getIntentTransitionErrorMessage(decision, currentIntent.reviewStatus));
    }
  }

  if (decision === 'reject') {
    if (currentIntent.reviewStatus === 'rejected') {
      return true;
    }

    if (currentIntent.reviewStatus !== 'nominated') {
      throw new Error(getIntentTransitionErrorMessage(decision, currentIntent.reviewStatus));
    }
  }

  if (decision === 'reset') {
    if (currentIntent.reviewStatus === 'captured') {
      return true;
    }
  }

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
