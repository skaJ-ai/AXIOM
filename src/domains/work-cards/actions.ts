import { and, eq, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { sessionsTable, workCardsTable } from '@/lib/db/schema';

import { canTransitionWorkCardStatus, getInvalidWorkCardTransitionMessage } from './state';

import type { WorkCardListItem, WorkCardSummary } from './types';

function mapWorkCardRowToSummary(row: {
  audience: string | null;
  id: string;
  priority: WorkCardSummary['priority'] | null;
  processLabel: string | null;
  sensitivity: WorkCardSummary['sensitivity'] | null;
  status: WorkCardSummary['status'] | null;
  title: string | null;
}): WorkCardSummary {
  return {
    audience: row.audience,
    id: row.id,
    priority: row.priority ?? 'medium',
    processLabel: row.processLabel,
    sensitivity: row.sensitivity ?? 'general',
    status: row.status ?? 'active',
    title: row.title ?? 'Untitled work card',
  };
}

function mapWorkCardRowToListItem(row: {
  audience: string | null;
  createdAt: Date;
  id: string;
  priority: WorkCardSummary['priority'] | null;
  processLabel: string | null;
  sensitivity: WorkCardSummary['sensitivity'] | null;
  sessionCount: number;
  status: WorkCardSummary['status'] | null;
  title: string | null;
  updatedAt: Date;
}): WorkCardListItem {
  const summary = mapWorkCardRowToSummary(row);

  return {
    ...summary,
    createdAt: row.createdAt.toISOString(),
    sessionCount: row.sessionCount,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function createWorkCard({
  audience,
  database,
  ownerId,
  processLabel,
  title,
  workspaceId,
}: {
  audience?: string;
  database?: ReturnType<typeof getDb>;
  ownerId?: string;
  processLabel?: string;
  title: string;
  workspaceId: string;
}): Promise<WorkCardSummary> {
  const client = database ?? getDb();
  const createdCards = await client
    .insert(workCardsTable)
    .values({
      audience: audience?.trim() ? audience.trim() : null,
      ownerId: ownerId ?? null,
      processLabel: processLabel?.trim() ? processLabel.trim() : null,
      title: title.trim(),
      workspaceId,
    })
    .returning({
      audience: workCardsTable.audience,
      id: workCardsTable.id,
      priority: workCardsTable.priority,
      processLabel: workCardsTable.processLabel,
      sensitivity: workCardsTable.sensitivity,
      status: workCardsTable.status,
      title: workCardsTable.title,
    });

  const createdCard = createdCards[0];

  if (!createdCard) {
    throw new Error('Failed to create work card.');
  }

  return mapWorkCardRowToSummary(createdCard);
}

async function updateWorkCardForWorkspace({
  audience,
  priority,
  processLabel,
  sensitivity,
  status,
  title,
  workCardId,
  workspaceId,
}: {
  audience?: string | null;
  priority?: WorkCardSummary['priority'];
  processLabel?: string | null;
  sensitivity?: WorkCardSummary['sensitivity'];
  status?: WorkCardSummary['status'];
  title?: string;
  workCardId: string;
  workspaceId: string;
}): Promise<WorkCardListItem> {
  const database = getDb();
  const existingRows = await database
    .select({
      status: workCardsTable.status,
    })
    .from(workCardsTable)
    .where(and(eq(workCardsTable.id, workCardId), eq(workCardsTable.workspaceId, workspaceId)))
    .limit(1);
  const existingCard = existingRows[0];

  if (!existingCard) {
    throw new Error('Work card not found.');
  }

  const currentStatus = existingCard.status ?? 'active';

  if (typeof status === 'string' && !canTransitionWorkCardStatus(currentStatus, status)) {
    throw new Error(getInvalidWorkCardTransitionMessage(currentStatus, status));
  }

  const updatedRows = await database
    .update(workCardsTable)
    .set({
      audience:
        typeof audience === 'string'
          ? audience.trim().length > 0
            ? audience.trim()
            : null
          : undefined,
      priority,
      processLabel:
        typeof processLabel === 'string'
          ? processLabel.trim().length > 0
            ? processLabel.trim()
            : null
          : undefined,
      sensitivity,
      status,
      title: typeof title === 'string' ? title.trim() : undefined,
      updatedAt: sql`now()`,
    })
    .where(and(eq(workCardsTable.id, workCardId), eq(workCardsTable.workspaceId, workspaceId)))
    .returning({
      audience: workCardsTable.audience,
      createdAt: workCardsTable.createdAt,
      id: workCardsTable.id,
      priority: workCardsTable.priority,
      processLabel: workCardsTable.processLabel,
      sensitivity: workCardsTable.sensitivity,
      sessionCount: sql<number>`(
        select count(*)::int
        from ${sessionsTable}
        where ${sessionsTable.workCardId} = ${workCardsTable.id}
          and ${sessionsTable.workspaceId} = ${workspaceId}
      )`,
      status: workCardsTable.status,
      title: workCardsTable.title,
      updatedAt: workCardsTable.updatedAt,
    });

  const updatedCard = updatedRows[0];

  if (!updatedCard) {
    throw new Error('Work card not found.');
  }

  return mapWorkCardRowToListItem(updatedCard);
}

async function archiveWorkCardForWorkspace(
  workCardId: string,
  workspaceId: string,
): Promise<WorkCardListItem> {
  return updateWorkCardForWorkspace({
    status: 'archived',
    workCardId,
    workspaceId,
  });
}

async function restoreWorkCardForWorkspace(
  workCardId: string,
  workspaceId: string,
): Promise<WorkCardListItem> {
  const database = getDb();
  const existingRows = await database
    .select({
      status: workCardsTable.status,
    })
    .from(workCardsTable)
    .where(and(eq(workCardsTable.id, workCardId), eq(workCardsTable.workspaceId, workspaceId)))
    .limit(1);
  const existingCard = existingRows[0];

  if (!existingCard) {
    throw new Error('Work card not found.');
  }

  if ((existingCard.status ?? 'active') !== 'archived') {
    throw new Error('보관된 업무 카드만 복원할 수 있습니다.');
  }

  const updatedRows = await database
    .update(workCardsTable)
    .set({
      status: 'active',
      updatedAt: sql`now()`,
    })
    .where(and(eq(workCardsTable.id, workCardId), eq(workCardsTable.workspaceId, workspaceId)))
    .returning({
      audience: workCardsTable.audience,
      createdAt: workCardsTable.createdAt,
      id: workCardsTable.id,
      priority: workCardsTable.priority,
      processLabel: workCardsTable.processLabel,
      sensitivity: workCardsTable.sensitivity,
      sessionCount: sql<number>`(
        select count(*)::int
        from ${sessionsTable}
        where ${sessionsTable.workCardId} = ${workCardsTable.id}
          and ${sessionsTable.workspaceId} = ${workspaceId}
      )`,
      status: workCardsTable.status,
      title: workCardsTable.title,
      updatedAt: workCardsTable.updatedAt,
    });
  const restoredCard = updatedRows[0];

  if (!restoredCard) {
    throw new Error('Work card not found.');
  }

  return mapWorkCardRowToListItem(restoredCard);
}

export {
  archiveWorkCardForWorkspace,
  createWorkCard,
  mapWorkCardRowToListItem,
  mapWorkCardRowToSummary,
  restoreWorkCardForWorkspace,
  updateWorkCardForWorkspace,
};
