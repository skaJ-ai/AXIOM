import { z } from 'zod';

const promoteIntentAssetsRequestSchema = z.object({
  intentIds: z
    .array(z.string().uuid('승격할 검토 항목 식별자가 올바르지 않습니다.'))
    .min(1, '승격할 검토 항목을 하나 이상 선택해 주세요.')
    .max(100, '한 번에 승격할 수 있는 검토 항목은 100개까지입니다.'),
});

export { promoteIntentAssetsRequestSchema };
