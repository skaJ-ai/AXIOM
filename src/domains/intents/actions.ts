import { and, eq, inArray, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { intentFragmentsTable } from '@/lib/db/schema';

import { extractIntentFragmentsFromText } from './extraction';

import type { IntentFragmentDraft } from './types';

type IntentReviewDecision = 'approve' | 'reject' | 'reset';

function getIntentConcurrentUpdateMessage(): string {
  return 'Intent 상태가 변경되어 요청을 처리하지 못했습니다. 새로고침 후 다시 시도해 주세요.';
}

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
  const existingRows = await database
    .select({
      content: intentFragmentsTable.content,
      type: intentFragmentsTable.type,
    })
    .from(intentFragmentsTable)
    .where(
      and(
        eq(intentFragmentsTable.sessionId, sessionId),
        eq(intentFragmentsTable.workspaceId, workspaceId),
        inArray(
          intentFragmentsTable.type,
          fragments.map((fragment) => fragment.type),
        ),
        inArray(
          intentFragmentsTable.content,
          fragments.map((fragment) => fragment.content),
        ),
      ),
    );
  const existingKeys = new Set(
    existingRows.map((row) => `${row.type}:${row.content.trim().toLowerCase()}`),
  );
  const nextFragments = fragments.filter((fragment) => {
    const key = `${fragment.type}:${fragment.content.trim().toLowerCase()}`;
    return !existingKeys.has(key);
  });

  if (nextFragments.length === 0) {
    return;
  }

  await database.insert(intentFragmentsTable).values(
    nextFragments.map((fragment) => ({
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
      reviewStatus: 'nominated',
      reviewedAt: null,
      reviewedBy: null,
    })
    .where(
      and(
        eq(intentFragmentsTable.id, id),
        eq(intentFragmentsTable.workspaceId, workspaceId),
        eq(intentFragmentsTable.reviewStatus, 'captured'),
      ),
    )
    .returning({ id: intentFragmentsTable.id });

  if (updatedRows.length === 0) {
    throw new Error(getIntentConcurrentUpdateMessage());
  }

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
          reviewStatus: 'approved' as const,
          reviewedAt: sql`now()`,
          reviewedBy: reviewerId,
        }
      : decision === 'reject'
        ? {
            reviewStatus: 'rejected' as const,
            reviewedAt: sql`now()`,
            reviewedBy: reviewerId,
          }
        : {
            reviewStatus: 'captured' as const,
            reviewedAt: null,
            reviewedBy: null,
          };

  const updatedRows = await database
    .update(intentFragmentsTable)
    .set(nextValues)
    .where(
      and(
        eq(intentFragmentsTable.id, intentId),
        eq(intentFragmentsTable.workspaceId, workspaceId),
        eq(intentFragmentsTable.reviewStatus, currentIntent.reviewStatus),
      ),
    )
    .returning({ id: intentFragmentsTable.id });

  if (updatedRows.length === 0) {
    throw new Error(getIntentConcurrentUpdateMessage());
  }

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

export {
  captureIntentFragmentsForSessionMessage,
  createIntentFragments,
  nominateIntentFragment,
  reviewIntentFragment,
};
export type { IntentReviewDecision };
