import type {
  IntentFragmentType,
  PromotedAssetBucketScope,
  PromotedAssetMaturity,
  WorkCardSensitivity,
} from '@/lib/db/schema';

interface PromotedAssetMaturityUpdateSummary {
  id: string;
  maturity: PromotedAssetMaturity;
}

interface PromotedAssetMutationSummary {
  bucketScope: PromotedAssetBucketScope;
  id: string;
  maturity: PromotedAssetMaturity;
  sourceIntentId: string;
}

interface PromotedAssetSummary {
  bucketScope: PromotedAssetBucketScope;
  content: string;
  createdAt: string;
  id: string;
  maturity: PromotedAssetMaturity;
  processAssetId: string;
  processAssetName: string | null;
  scope: string | null;
  sourceIntentId: string;
  sourceSensitivity: WorkCardSensitivity;
  sourceSessionId: string | null;
  sourceWorkCardId: string | null;
  sourceWorkCardTitle: string | null;
  type: IntentFragmentType;
  verifiedAt: string | null;
}

export type {
  PromotedAssetMaturityUpdateSummary,
  PromotedAssetMutationSummary,
  PromotedAssetSummary,
};
