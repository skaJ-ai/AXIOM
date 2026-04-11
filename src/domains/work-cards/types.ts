import type { WorkCardPriority, WorkCardSensitivity, WorkCardStatus } from '@/lib/db/schema';

interface WorkCardSummary {
  audience: string | null;
  id: string;
  priority: WorkCardPriority;
  processLabel: string | null;
  sensitivity: WorkCardSensitivity;
  status: WorkCardStatus;
  title: string;
}

export type { WorkCardSummary };
