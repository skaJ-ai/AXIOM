import type {
  IntentFragmentConfidence,
  IntentFragmentReviewStatus,
  IntentFragmentType,
  PromotedAssetBucketScope,
  PromotedAssetMaturity,
} from '@/lib/db/schema';

interface IntentFragment {
  confidence: IntentFragmentConfidence;
  content: string;
  createdAt: string;
  id: string;
  reviewStatus: IntentFragmentReviewStatus;
  scope: string | null;
  speaker: string | null;
  type: IntentFragmentType;
}

interface IntentFragmentDraft {
  confidence?: IntentFragmentConfidence;
  content: string;
  scope?: string | null;
  speaker?: string | null;
  type: IntentFragmentType;
}

interface IntentReviewItem extends IntentFragment {
  isPromoted: boolean;
  processAssetId: string | null;
  processAssetName: string | null;
  promotedAssetId: string | null;
  promotedAssetMaturity: PromotedAssetMaturity | null;
  promotedBucketScope: PromotedAssetBucketScope | null;
  sessionId: string;
  sessionTitle: string;
  workCardId: string | null;
  workCardTitle: string | null;
}

export type { IntentFragment, IntentFragmentDraft, IntentReviewItem };
