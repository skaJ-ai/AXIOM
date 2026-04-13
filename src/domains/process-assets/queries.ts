import { and, asc, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { processAssetsTable } from '@/lib/db/schema';

import type { ProcessAssetSummary } from './types';

function mapProcessAssetRowToSummary(row: {
  createdAt: Date;
  description: string | null;
  domainLabel: string | null;
  id: string;
  name: string | null;
  updatedAt: Date;
}): ProcessAssetSummary {
  return {
    createdAt: row.createdAt.toISOString(),
    description: row.description,
    domainLabel: row.domainLabel,
    id: row.id,
    name: row.name ?? '이름 없는 프로세스 자산',
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function listProcessAssetsByWorkspace(workspaceId: string): Promise<ProcessAssetSummary[]> {
  const database = getDb();
  const rows = await database
    .select({
      createdAt: processAssetsTable.createdAt,
      description: processAssetsTable.description,
      domainLabel: processAssetsTable.domainLabel,
      id: processAssetsTable.id,
      name: processAssetsTable.name,
      updatedAt: processAssetsTable.updatedAt,
    })
    .from(processAssetsTable)
    .where(eq(processAssetsTable.workspaceId, workspaceId))
    .orderBy(asc(processAssetsTable.name), asc(processAssetsTable.createdAt));

  return rows.map((row) => mapProcessAssetRowToSummary(row));
}

async function getProcessAssetByIdForWorkspace(
  processAssetId: string,
  workspaceId: string,
  options?: {
    database?: ReturnType<typeof getDb>;
  },
): Promise<ProcessAssetSummary | null> {
  const database = options?.database ?? getDb();
  const rows = await database
    .select({
      createdAt: processAssetsTable.createdAt,
      description: processAssetsTable.description,
      domainLabel: processAssetsTable.domainLabel,
      id: processAssetsTable.id,
      name: processAssetsTable.name,
      updatedAt: processAssetsTable.updatedAt,
    })
    .from(processAssetsTable)
    .where(
      and(
        eq(processAssetsTable.id, processAssetId),
        eq(processAssetsTable.workspaceId, workspaceId),
      ),
    )
    .limit(1);
  const row = rows[0];

  if (!row) {
    return null;
  }

  return mapProcessAssetRowToSummary(row);
}

export {
  getProcessAssetByIdForWorkspace,
  listProcessAssetsByWorkspace,
  mapProcessAssetRowToSummary,
};
