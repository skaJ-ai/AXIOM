import { and, eq, inArray, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { intentFragmentsTable } from '@/lib/db/schema';

import { extractIntentFragmentsFromText } from './extraction';

import type { IntentFragmentDraft } from './types';

type IntentReviewDecision = 'approve' | 'reject' | 'reset';
type IntentBatchAction = IntentReviewDecision | 'nominate';
type IntentReviewStatus = 'approved' | 'captured' | 'nominated' | 'rejected';

function getIntentConcurrentUpdateMessage(): string {
  return '의도 상태가 이미 변경되어 요청을 처리하지 못했습니다. 새로고침 후 다시 시도해 주세요.';
}

function getIntentTransitionErrorMessage(
  decision: IntentBatchAction,
  currentStatus: IntentReviewStatus,
): string {
  if (decision === 'nominate') {
    return `Intent는 ${currentStatus} 상태에서 nominated로 바꿀 수 없습니다.`;
  }

  if (decision === 'reset') {
    return `Intent는 ${currentStatus} 상태에서 captured로 되돌릴 수 없습니다.`;
  }

  return `Intent ${decision}는 nominated 상태에서만 가능합니다.`;
}

function createIntentDeduplicationKey(fragment: {
  content: string;
  type: IntentFragmentDraft['type'];
}): string {
  return `${fragment.type}:${fragment.content.trim().toLowerCase()}`;
}

function getBatchActionTargetStatuses(action: IntentBatchAction): IntentReviewStatus[] {
  switch (action) {
    case 'nominate':
      return ['captured'];
    case 'approve':
    case 'reject':
      return ['nominated'];
    case 'reset':
      return ['approved', 'nominated', 'rejected'];
    default:
      return [];
  }
}

function getIntentActionUpdateValues(action: IntentBatchAction, reviewerId: string) {
  switch (action) {
    case 'approve':
      return {
        reviewStatus: 'approved' as const,
        reviewedAt: sql`now()`,
        reviewedBy: reviewerId,
      };
    case 'reject':
      return {
        reviewStatus: 'rejected' as const,
        reviewedAt: sql`now()`,
        reviewedBy: reviewerId,
      };
    case 'nominate':
      return {
        reviewStatus: 'nominated' as const,
        reviewedAt: null,
        reviewedBy: null,
      };
    case 'reset':
      return {
        reviewStatus: 'captured' as const,
        reviewedAt: null,
        reviewedBy: null,
      };
    default:
      return {
        reviewStatus: 'captured' as const,
        reviewedAt: null,
        reviewedBy: null,
      };
  }
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
      ),
    );
  const existingKeys = new Set(existingRows.map((row) => createIntentDeduplicationKey(row)));
  const nextFragments = fragments.filter((fragment) => {
    const key = createIntentDeduplicationKey(fragment);
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
    .set(getIntentActionUpdateValues('nominate', ''))
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

  if (decision === 'reset' && currentIntent.reviewStatus === 'captured') {
    return true;
  }

  const updatedRows = await database
    .update(intentFragmentsTable)
    .set(getIntentActionUpdateValues(decision, reviewerId))
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

async function reviewIntentFragmentsBatch({
  action,
  intentIds,
  reviewerId,
  workspaceId,
}: {
  action: IntentBatchAction;
  intentIds: string[];
  reviewerId: string;
  workspaceId: string;
}): Promise<string[]> {
  const uniqueIntentIds = Array.from(new Set(intentIds.map((id) => id.trim()).filter(Boolean)));

  if (uniqueIntentIds.length === 0) {
    return [];
  }

  const database = getDb();
  const targetStatuses = getBatchActionTargetStatuses(action);

  if (targetStatuses.length === 0) {
    return [];
  }

  const updatedRows = await database
    .update(intentFragmentsTable)
    .set(getIntentActionUpdateValues(action, reviewerId))
    .where(
      and(
        eq(intentFragmentsTable.workspaceId, workspaceId),
        inArray(intentFragmentsTable.id, uniqueIntentIds),
        inArray(intentFragmentsTable.reviewStatus, targetStatuses),
      ),
    )
    .returning({ id: intentFragmentsTable.id });

  return updatedRows.map((row) => row.id);
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
  reviewIntentFragmentsBatch,
};
export type { IntentBatchAction, IntentReviewDecision };
