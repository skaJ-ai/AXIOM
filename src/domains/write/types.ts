import type { ReportStatus, ReportType, ReportSection } from '@/lib/db/schema';

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
