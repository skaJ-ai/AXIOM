import type { ProcessAssetSummary } from '@/domains/process-assets/types';
import type { WorkCardPriority, WorkCardSensitivity, WorkCardStatus } from '@/lib/db/schema';

interface WorkCardSummary {
  audience: string | null;
  id: string;
  priority: WorkCardPriority;
  processAsset: ProcessAssetSummary | null;
  processLabel: string | null;
  sensitivity: WorkCardSensitivity;
  status: WorkCardStatus;
  title: string;
}

interface WorkCardListItem extends WorkCardSummary {
  createdAt: string;
  sessionCount: number;
  updatedAt: string;
}

export type { WorkCardListItem, WorkCardSummary };
