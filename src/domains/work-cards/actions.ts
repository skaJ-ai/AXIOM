import { and, eq, sql } from 'drizzle-orm';

import { getProcessAssetByIdForWorkspace } from '@/domains/process-assets/queries';
import type { ProcessAssetSummary } from '@/domains/process-assets/types';
import { getDb } from '@/lib/db';
import { processAssetsTable, sessionsTable, workCardsTable } from '@/lib/db/schema';

import { canTransitionWorkCardStatus, getInvalidWorkCardTransitionMessage } from './state';

import type { WorkCardListItem, WorkCardSummary } from './types';

function mapProcessAssetRowToSummary(row: {
  processAssetCreatedAt?: Date | null;
  processAssetDescription?: string | null;
  processAssetDomainLabel?: string | null;
  processAssetId?: string | null;
  processAssetName?: string | null;
  processAssetUpdatedAt?: Date | null;
}): ProcessAssetSummary | null {
  if (!row.processAssetId) {
    return null;
  }

  return {
    createdAt: row.processAssetCreatedAt?.toISOString() ?? new Date(0).toISOString(),
    description: row.processAssetDescription ?? null,
    domainLabel: row.processAssetDomainLabel ?? null,
    id: row.processAssetId,
    name: row.processAssetName ?? '이름 없는 프로세스 자산',
    updatedAt: row.processAssetUpdatedAt?.toISOString() ?? new Date(0).toISOString(),
  };
}

function mapWorkCardRowToSummary(row: {
  audience: string | null;
  id: string;
  priority: WorkCardSummary['priority'] | null;
  processAssetCreatedAt?: Date | null;
  processAssetDescription?: string | null;
  processAssetDomainLabel?: string | null;
  processAssetId?: string | null;
  processAssetName?: string | null;
  processAssetUpdatedAt?: Date | null;
  processLabel: string | null;
  sensitivity: WorkCardSummary['sensitivity'] | null;
  status: WorkCardSummary['status'] | null;
  title: string | null;
}): WorkCardSummary {
  return {
    audience: row.audience,
    id: row.id,
    priority: row.priority ?? 'medium',
    processAsset: mapProcessAssetRowToSummary(row),
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
  processAssetCreatedAt?: Date | null;
  processAssetDescription?: string | null;
  processAssetDomainLabel?: string | null;
  processAssetId?: string | null;
  processAssetName?: string | null;
  processAssetUpdatedAt?: Date | null;
  processLabel: string | null;
  sensitivity: WorkCardSummary['sensitivity'] | null;
  sessionCount: number;
  status: WorkCardSummary['status'] | null;
  title: string | null;
  updatedAt: Date;
}): WorkCardListItem {
  return {
    audience: row.audience,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    priority: row.priority ?? 'medium',
    processAsset: mapProcessAssetRowToSummary(row),
    processLabel: row.processLabel,
    sensitivity: row.sensitivity ?? 'general',
    sessionCount: row.sessionCount,
    status: row.status ?? 'active',
    title: row.title ?? 'Untitled work card',
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function resolveProcessAsset(
  processAssetId: string | null | undefined,
  workspaceId: string,
  options?: {
    database?: ReturnType<typeof getDb>;
  },
): Promise<ProcessAssetSummary | null> {
  if (typeof processAssetId !== 'string' || processAssetId.trim().length === 0) {
    return null;
  }

  const processAsset = await getProcessAssetByIdForWorkspace(processAssetId.trim(), workspaceId, {
    database: options?.database,
  });

  if (!processAsset) {
    throw new Error('선택한 프로세스 자산을 찾을 수 없습니다.');
  }

  return processAsset;
}

async function findWorkCardListItemById(
  database: ReturnType<typeof getDb>,
  workCardId: string,
  workspaceId: string,
): Promise<WorkCardListItem | null> {
  const rows = await database
    .select({
      audience: workCardsTable.audience,
      createdAt: workCardsTable.createdAt,
      id: workCardsTable.id,
      priority: workCardsTable.priority,
      processAssetCreatedAt: processAssetsTable.createdAt,
      processAssetDescription: processAssetsTable.description,
      processAssetDomainLabel: processAssetsTable.domainLabel,
      processAssetId: workCardsTable.processAssetId,
      processAssetName: processAssetsTable.name,
      processAssetUpdatedAt: processAssetsTable.updatedAt,
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
    .leftJoin(processAssetsTable, eq(workCardsTable.processAssetId, processAssetsTable.id))
    .where(and(eq(workCardsTable.id, workCardId), eq(workCardsTable.workspaceId, workspaceId)))
    .limit(1);
  const row = rows[0];

  return row ? mapWorkCardRowToListItem(row) : null;
}

async function createWorkCard({
  audience,
  database,
  ownerId,
  processAssetId,
  processLabel,
  title,
  workspaceId,
}: {
  audience?: string;
  database?: ReturnType<typeof getDb>;
  ownerId?: string;
  processAssetId?: string;
  processLabel?: string;
  title: string;
  workspaceId: string;
}): Promise<WorkCardSummary> {
  const client = database ?? getDb();
  const processAsset = await resolveProcessAsset(processAssetId, workspaceId, { database: client });
  const createdCards = await client
    .insert(workCardsTable)
    .values({
      audience: audience?.trim() ? audience.trim() : null,
      ownerId: ownerId ?? null,
      processAssetId: processAsset?.id ?? null,
      processLabel: processAsset?.name ?? (processLabel?.trim() ? processLabel.trim() : null),
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

  return {
    ...mapWorkCardRowToSummary(createdCard),
    processAsset,
  };
}

async function updateWorkCardForWorkspace({
  audience,
  priority,
  processAssetId,
  processLabel,
  sensitivity,
  status,
  title,
  workCardId,
  workspaceId,
}: {
  audience?: string | null;
  priority?: WorkCardSummary['priority'];
  processAssetId?: string | null;
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

  const processAsset = await resolveProcessAsset(processAssetId, workspaceId, { database });

  await database
    .update(workCardsTable)
    .set({
      audience:
        typeof audience === 'string'
          ? audience.trim().length > 0
            ? audience.trim()
            : null
          : undefined,
      priority,
      processAssetId: processAssetId === null ? null : processAsset ? processAsset.id : undefined,
      processLabel: processAsset
        ? processAsset.name
        : typeof processLabel === 'string'
          ? processLabel.trim().length > 0
            ? processLabel.trim()
            : null
          : processAssetId === null
            ? null
            : undefined,
      sensitivity,
      status,
      title: typeof title === 'string' ? title.trim() : undefined,
      updatedAt: sql`now()`,
    })
    .where(and(eq(workCardsTable.id, workCardId), eq(workCardsTable.workspaceId, workspaceId)));

  const updatedCard = await findWorkCardListItemById(database, workCardId, workspaceId);

  if (!updatedCard) {
    throw new Error('Work card not found.');
  }

  return updatedCard;
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

  await database
    .update(workCardsTable)
    .set({
      status: 'active',
      updatedAt: sql`now()`,
    })
    .where(and(eq(workCardsTable.id, workCardId), eq(workCardsTable.workspaceId, workspaceId)));

  const restoredCard = await findWorkCardListItemById(database, workCardId, workspaceId);

  if (!restoredCard) {
    throw new Error('Work card not found.');
  }

  return restoredCard;
}

export {
  archiveWorkCardForWorkspace,
  createWorkCard,
  mapWorkCardRowToListItem,
  mapWorkCardRowToSummary,
  restoreWorkCardForWorkspace,
  updateWorkCardForWorkspace,
};
