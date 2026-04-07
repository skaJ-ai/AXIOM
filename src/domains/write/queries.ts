import { and, desc, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { reportsTable } from '@/lib/db/schema';

import type { Report } from './types';

function mapReportRow(row: {
  createdAt: Date;
  id: string;
  reportType: string;
  sections: unknown;
  sessionId: string | null;
  status: string;
  title: string;
  updatedAt: Date;
  version: number;
  workspaceId: string;
}): Report {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  } as Report;
}

async function listReportsByWorkspace(workspaceId: string): Promise<Report[]> {
  const database = getDb();
  const rows = await database
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.workspaceId, workspaceId))
    .orderBy(desc(reportsTable.updatedAt));

  return rows.map(mapReportRow);
}

async function getReportDetail(reportId: string, workspaceId: string): Promise<Report | null> {
  const database = getDb();
  const rows = await database
    .select()
    .from(reportsTable)
    .where(and(eq(reportsTable.id, reportId), eq(reportsTable.workspaceId, workspaceId)))
    .limit(1);

  const row = rows[0];

  if (!row) {
    return null;
  }

  return mapReportRow(row);
}

export { getReportDetail, listReportsByWorkspace };
