import { z } from 'zod';

const resolvePromotedAssetConflictRequestSchema = z.object({
  resolutionType: z.enum(['accept_both', 'archive_a', 'archive_b'], {
    message: '충돌 해결 방식이 올바르지 않습니다.',
  }),
});

export { resolvePromotedAssetConflictRequestSchema };
