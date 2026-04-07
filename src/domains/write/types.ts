import type { ReportStatus, ReportType, ReportSection } from '@/lib/db/schema';

// TODO(v0.3): Consolidate deliverables and reports into a single write domain. See Codex review blocker 5.

interface Report {
  createdAt: string;
  id: string;
  reportType: ReportType;
  sections: ReportSection[];
  sessionId: string | null;
  status: ReportStatus;
  title: string;
  updatedAt: string;
  version: number;
  workspaceId: string;
}

export type { Report };
