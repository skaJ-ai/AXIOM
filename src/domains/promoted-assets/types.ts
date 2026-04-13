import type { IntentFragmentType } from '@/lib/db/schema';

interface PromotedAssetSummary {
  content: string;
  createdAt: string;
  id: string;
  processAssetId: string;
  processAssetName: string | null;
  scope: string | null;
  sourceIntentId: string;
  sourceSessionId: string | null;
  sourceWorkCardId: string | null;
  sourceWorkCardTitle: string | null;
  type: IntentFragmentType;
}

export type { PromotedAssetSummary };
