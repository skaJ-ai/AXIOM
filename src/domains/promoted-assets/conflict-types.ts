import type {
  IntentFragmentType,
  PromotedAssetBucketScope,
  PromotedAssetConflictResolutionType,
  PromotedAssetConflictStatus,
  PromotedAssetConflictType,
  PromotedAssetMaturity,
  PromotedAssetStatus,
  WorkCardSensitivity,
} from '@/lib/db/schema';

interface PromotedAssetConflictAssetSummary {
  bucketScope: PromotedAssetBucketScope;
  content: string;
  createdAt: string;
  id: string;
  maturity: PromotedAssetMaturity;
  scope: string | null;
  sourceIntentId: string;
  sourceSensitivity: WorkCardSensitivity;
  sourceWorkCardId: string | null;
  sourceWorkCardTitle: string | null;
  status: PromotedAssetStatus;
  type: IntentFragmentType;
  verifiedAt: string | null;
}

interface PromotedAssetConflictItem {
  assetA: PromotedAssetConflictAssetSummary;
  assetB: PromotedAssetConflictAssetSummary;
  conflictType: PromotedAssetConflictType;
  detectedAt: string;
  id: string;
  processAssetId: string;
  processAssetName: string | null;
  resolutionType: PromotedAssetConflictResolutionType | null;
  resolvedAt: string | null;
  status: PromotedAssetConflictStatus;
}

export type { PromotedAssetConflictAssetSummary, PromotedAssetConflictItem };
