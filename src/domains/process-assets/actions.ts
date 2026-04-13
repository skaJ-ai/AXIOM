import { getDb } from '@/lib/db';
import { processAssetsTable } from '@/lib/db/schema';

import { mapProcessAssetRowToSummary } from './queries';

import type { ProcessAssetSummary } from './types';

async function createProcessAsset({
  description,
  domainLabel,
  name,
  workspaceId,
}: {
  description?: string;
  domainLabel?: string;
  name: string;
  workspaceId: string;
}): Promise<ProcessAssetSummary> {
  const database = getDb();
  const createdRows = await database
    .insert(processAssetsTable)
    .values({
      description: description?.trim() ? description.trim() : null,
      domainLabel: domainLabel?.trim() ? domainLabel.trim() : null,
      name: name.trim(),
      workspaceId,
    })
    .returning({
      createdAt: processAssetsTable.createdAt,
      description: processAssetsTable.description,
      domainLabel: processAssetsTable.domainLabel,
      id: processAssetsTable.id,
      name: processAssetsTable.name,
      updatedAt: processAssetsTable.updatedAt,
    });
  const createdAsset = createdRows[0];

  if (!createdAsset) {
    throw new Error('Failed to create process asset.');
  }

  return mapProcessAssetRowToSummary(createdAsset);
}

export { createProcessAsset };
