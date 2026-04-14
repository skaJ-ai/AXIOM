import type { PromotedAssetBucketScope } from '@/lib/db/schema';

const PROMOTED_ASSET_BUCKET_SCOPES = ['personal', 'workspace'] as const;

function formatPromotedAssetBucketScope(bucketScope: PromotedAssetBucketScope): string {
  switch (bucketScope) {
    case 'personal':
      return '개인';
    case 'workspace':
      return '공용';
    default:
      return bucketScope;
  }
}

export { PROMOTED_ASSET_BUCKET_SCOPES, formatPromotedAssetBucketScope };
