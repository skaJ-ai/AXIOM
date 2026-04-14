import { z } from 'zod';

import { PROMOTED_ASSET_BUCKET_SCOPES } from './bucket-scope';
import { PROMOTED_ASSET_MATURITIES } from './maturity';

const promoteIntentAssetsRequestSchema = z.object({
  bucketScope: z.enum(PROMOTED_ASSET_BUCKET_SCOPES).default('workspace'),
  intentIds: z
    .array(z.string().uuid('?밴꺽??寃????ぉ ?앸퀎?먭? ?щ컮瑜댁? ?딆뒿?덈떎.'))
    .min(1, '?밴꺽??寃????ぉ???섎굹 ?댁긽 ?좏깮??二쇱꽭??')
    .max(100, '??踰덉뿉 ?밴꺽?????덈뒗 寃????ぉ? 100媛쒓퉴吏?낅땲??'),
});

const updatePromotedAssetMaturityRequestSchema = z.object({
  assetIds: z
    .array(z.string().uuid('?먯궛 ?앸퀎?먭? ?щ컮瑜댁? ?딆뒿?덈떎.'))
    .min(1, '?낅뜲?댄듃??먯궛???섎굹 ?댁긽 ?좏깮??二쇱꽭??')
    .max(100, '??踰덉뿉 蹂寃쏀븷 ???덈뒗 ?먯궛? 100媛쒓퉴吏?낅땲??'),
  maturity: z.enum(PROMOTED_ASSET_MATURITIES),
});

export { promoteIntentAssetsRequestSchema, updatePromotedAssetMaturityRequestSchema };
