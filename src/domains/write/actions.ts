import { eq, sql } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import type { ReportSection, ReportStatus, ReportType } from '@/lib/db/schema';
import { reportsTable } from '@/lib/db/schema';
import { runKnowledgeExtractionPipeline } from '@/lib/knowledge/pipeline';

import type { Report } from './types';

// TODO(v0.3): Consolidate deliverables and reports into a single write domain. See Codex review blocker 5.

async function createReport({
  reportType,
  sections,
  sessionId,
  title,
  workspaceId,
}: {
  reportType: ReportType;
  sections: ReportSection[];
  sessionId?: string;
  title: string;
  workspaceId: string;
}): Promise<string> {
  const database = getDb();
  const rows = await database
    .insert(reportsTable)
    .values({
      reportType,
      sections,
      sessionId: sessionId ?? null,
      status: 'draft',
      title,
      workspaceId,
    })
    .returning({ id: reportsTable.id });

  const row = rows[0];

  if (!row) {
    throw new Error('보고서 생성에 실패했습니다.');
  }

  return row.id;
}

async function updateReport(
  reportId: string,
  updates: {
    sections?: ReportSection[];
    status?: ReportStatus;
    title?: string;
  },
): Promise<void> {
  const database = getDb();
  await database
    .update(reportsTable)
    .set({
      ...updates,
      updatedAt: sql`now()`,
    })
    .where(eq(reportsTable.id, reportId));
}

async function finalizeReport(reportId: string): Promise<void> {
  const database = getDb();
  const updatedRows = await database
    .update(reportsTable)
    .set({
      status: 'final',
      updatedAt: sql`now()`,
    })
    .where(eq(reportsTable.id, reportId))
    .returning();

  const updated = updatedRows[0];

  if (!updated) {
    return;
  }

  const finalizedReport: Report = {
    createdAt: updated.createdAt.toISOString(),
    id: updated.id,
    reportType: updated.reportType,
    sections: updated.sections,
    sessionId: updated.sessionId,
    status: updated.status,
    title: updated.title,
    updatedAt: updated.updatedAt.toISOString(),
    version: updated.version,
    workspaceId: updated.workspaceId,
  };

  await runKnowledgeExtractionPipeline(finalizedReport);
}

export { createReport, finalizeReport, updateReport };
