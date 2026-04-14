import { and, desc, eq, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { getDb } from '@/lib/db';
import {
  processAssetsTable,
  promotedAssetConflictsTable,
  promotedAssetsTable,
  workCardsTable,
} from '@/lib/db/schema';

import type { PromotedAssetConflictItem } from './conflict-types';

const assetATable = alias(promotedAssetsTable, 'promoted_asset_conflict_asset_a');
const assetBTable = alias(promotedAssetsTable, 'promoted_asset_conflict_asset_b');
const workCardATable = alias(workCardsTable, 'promoted_asset_conflict_work_card_a');
const workCardBTable = alias(workCardsTable, 'promoted_asset_conflict_work_card_b');

function mapConflictRow(row: {
  assetAContent: string;
  assetACreatedAt: Date;
  assetAId: string;
  assetAScope: string | null;
  assetASourceIntentId: string;
  assetASourceSensitivity: 'confidential' | 'general' | 'restricted';
  assetASourceWorkCardId: string | null;
  assetASourceWorkCardTitle: string | null;
  assetAStatus: 'active' | 'archived';
  assetAType: PromotedAssetConflictItem['assetA']['type'];
  assetBContent: string;
  assetBCreatedAt: Date;
  assetBId: string;
  assetBScope: string | null;
  assetBSourceIntentId: string;
  assetBSourceSensitivity: 'confidential' | 'general' | 'restricted';
  assetBSourceWorkCardId: string | null;
  assetBSourceWorkCardTitle: string | null;
  assetBStatus: 'active' | 'archived';
  assetBType: PromotedAssetConflictItem['assetB']['type'];
  conflictType: PromotedAssetConflictItem['conflictType'];
  detectedAt: Date;
  id: string;
  processAssetId: string;
  processAssetName: string | null;
  resolutionType: PromotedAssetConflictItem['resolutionType'];
  resolvedAt: Date | null;
  status: PromotedAssetConflictItem['status'];
}): PromotedAssetConflictItem {
  return {
    assetA: {
      content: row.assetAContent,
      createdAt: row.assetACreatedAt.toISOString(),
      id: row.assetAId,
      scope: row.assetAScope,
      sourceIntentId: row.assetASourceIntentId,
      sourceSensitivity: row.assetASourceSensitivity,
      sourceWorkCardId: row.assetASourceWorkCardId,
      sourceWorkCardTitle: row.assetASourceWorkCardTitle,
      status: row.assetAStatus,
      type: row.assetAType,
    },
    assetB: {
      content: row.assetBContent,
      createdAt: row.assetBCreatedAt.toISOString(),
      id: row.assetBId,
      scope: row.assetBScope,
      sourceIntentId: row.assetBSourceIntentId,
      sourceSensitivity: row.assetBSourceSensitivity,
      sourceWorkCardId: row.assetBSourceWorkCardId,
      sourceWorkCardTitle: row.assetBSourceWorkCardTitle,
      status: row.assetBStatus,
      type: row.assetBType,
    },
    conflictType: row.conflictType,
    detectedAt: row.detectedAt.toISOString(),
    id: row.id,
    processAssetId: row.processAssetId,
    processAssetName: row.processAssetName,
    resolutionType: row.resolutionType,
    resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
    status: row.status,
  };
}

async function listPromotedAssetConflictsByWorkspace(
  workspaceId: string,
  options?: {
    activeOnly?: boolean;
    statuses?: Array<'detected' | 'resolved'>;
  },
): Promise<PromotedAssetConflictItem[]> {
  const database = getDb();
  const rows = await database
    .select({
      assetAContent: assetATable.content,
      assetACreatedAt: assetATable.createdAt,
      assetAId: assetATable.id,
      assetAScope: assetATable.scope,
      assetASourceIntentId: assetATable.sourceIntentId,
      assetASourceSensitivity: assetATable.sourceSensitivity,
      assetASourceWorkCardId: assetATable.sourceWorkCardId,
      assetASourceWorkCardTitle: workCardATable.title,
      assetAStatus: assetATable.status,
      assetAType: assetATable.type,
      assetBContent: assetBTable.content,
      assetBCreatedAt: assetBTable.createdAt,
      assetBId: assetBTable.id,
      assetBScope: assetBTable.scope,
      assetBSourceIntentId: assetBTable.sourceIntentId,
      assetBSourceSensitivity: assetBTable.sourceSensitivity,
      assetBSourceWorkCardId: assetBTable.sourceWorkCardId,
      assetBSourceWorkCardTitle: workCardBTable.title,
      assetBStatus: assetBTable.status,
      assetBType: assetBTable.type,
      conflictType: promotedAssetConflictsTable.conflictType,
      detectedAt: promotedAssetConflictsTable.detectedAt,
      id: promotedAssetConflictsTable.id,
      processAssetId: promotedAssetConflictsTable.processAssetId,
      processAssetName: processAssetsTable.name,
      resolutionType: promotedAssetConflictsTable.resolutionType,
      resolvedAt: promotedAssetConflictsTable.resolvedAt,
      status: promotedAssetConflictsTable.status,
    })
    .from(promotedAssetConflictsTable)
    .innerJoin(assetATable, eq(promotedAssetConflictsTable.assetAId, assetATable.id))
    .innerJoin(assetBTable, eq(promotedAssetConflictsTable.assetBId, assetBTable.id))
    .innerJoin(
      processAssetsTable,
      eq(promotedAssetConflictsTable.processAssetId, processAssetsTable.id),
    )
    .leftJoin(workCardATable, eq(assetATable.sourceWorkCardId, workCardATable.id))
    .leftJoin(workCardBTable, eq(assetBTable.sourceWorkCardId, workCardBTable.id))
    .where(
      and(
        eq(promotedAssetConflictsTable.workspaceId, workspaceId),
        options?.statuses && options.statuses.length > 0
          ? inArray(promotedAssetConflictsTable.status, options.statuses)
          : undefined,
        options?.activeOnly
          ? and(eq(assetATable.status, 'active'), eq(assetBTable.status, 'active'))
          : undefined,
      ),
    )
    .orderBy(desc(promotedAssetConflictsTable.detectedAt), desc(promotedAssetConflictsTable.id));

  return rows.map(mapConflictRow);
}

export { listPromotedAssetConflictsByWorkspace };
