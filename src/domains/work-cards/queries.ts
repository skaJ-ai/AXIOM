import { and, desc, eq, ne, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { sessionsTable, workCardsTable } from '@/lib/db/schema';

import { mapWorkCardRowToListItem, mapWorkCardRowToSummary } from './actions';

import type { WorkCardListItem, WorkCardSummary } from './types';

async function listWorkCardsByWorkspace(
  workspaceId: string,
  options?: {
    includeArchived?: boolean;
  },
): Promise<WorkCardListItem[]> {
  const database = getDb();
  const rows = await database
    .select({
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
    })
    .from(workCardsTable)
    .where(
      options?.includeArchived
        ? eq(workCardsTable.workspaceId, workspaceId)
        : and(eq(workCardsTable.workspaceId, workspaceId), ne(workCardsTable.status, 'archived')),
    )
    .orderBy(desc(workCardsTable.updatedAt), desc(workCardsTable.createdAt));

  return rows.map((row) => mapWorkCardRowToListItem(row));
}

async function getWorkCardByIdForWorkspace(
  workCardId: string,
  workspaceId: string,
): Promise<WorkCardListItem | null> {
  const database = getDb();
  const rows = await database
    .select({
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
    })
    .from(workCardsTable)
    .where(and(eq(workCardsTable.id, workCardId), eq(workCardsTable.workspaceId, workspaceId)))
    .limit(1);

  const row = rows[0];
  return row ? mapWorkCardRowToListItem(row) : null;
}

async function getWorkCardSummaryByIdForWorkspace(
  workCardId: string,
  workspaceId: string,
  options?: {
    database?: ReturnType<typeof getDb>;
  },
): Promise<WorkCardSummary | null> {
  const database = options?.database ?? getDb();
  const rows = await database
    .select({
      audience: workCardsTable.audience,
      id: workCardsTable.id,
      priority: workCardsTable.priority,
      processLabel: workCardsTable.processLabel,
      sensitivity: workCardsTable.sensitivity,
      status: workCardsTable.status,
      title: workCardsTable.title,
    })
    .from(workCardsTable)
    .where(and(eq(workCardsTable.id, workCardId), eq(workCardsTable.workspaceId, workspaceId)))
    .limit(1);

  const row = rows[0];
  return row ? mapWorkCardRowToSummary(row) : null;
}

export {
  getWorkCardByIdForWorkspace,
  getWorkCardSummaryByIdForWorkspace,
  listWorkCardsByWorkspace,
};
