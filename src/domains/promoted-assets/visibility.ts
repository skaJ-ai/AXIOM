import { and, eq, or } from 'drizzle-orm';

import { promotedAssetsTable } from '@/lib/db/schema';

function createPromotedAssetBucketVisibilityFilter(currentUserId?: string) {
  if (!currentUserId) {
    return eq(promotedAssetsTable.bucketScope, 'workspace');
  }

  return or(
    eq(promotedAssetsTable.bucketScope, 'workspace'),
    and(
      eq(promotedAssetsTable.bucketScope, 'personal'),
      eq(promotedAssetsTable.createdBy, currentUserId),
    ),
  );
}

export { createPromotedAssetBucketVisibilityFilter };
