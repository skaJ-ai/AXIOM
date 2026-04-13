import type { IntentFragmentType, WorkCardSensitivity } from '@/lib/db/schema';

interface PromotedAssetSummary {
  content: string;
  createdAt: string;
  id: string;
  processAssetId: string;
  processAssetName: string | null;
  scope: string | null;
  sourceIntentId: string;
  sourceSensitivity: WorkCardSensitivity;
  sourceSessionId: string | null;
  sourceWorkCardId: string | null;
  sourceWorkCardTitle: string | null;
  type: IntentFragmentType;
}

export type { PromotedAssetSummary };
