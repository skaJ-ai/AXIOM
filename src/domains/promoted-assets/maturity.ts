import type { PromotedAssetMaturity } from '@/lib/db/schema';

const PROMOTED_ASSET_MATURITIES = ['promoted', 'verified_standard'] as const;

function formatPromotedAssetMaturity(maturity: PromotedAssetMaturity): string {
  switch (maturity) {
    case 'promoted':
      return '재사용 자산';
    case 'verified_standard':
      return '검증된 표준';
    default:
      return maturity;
  }
}

export { PROMOTED_ASSET_MATURITIES, formatPromotedAssetMaturity };
