import { z } from 'zod';

const createProcessAssetRequestSchema = z.object({
  description: z.string().trim().max(500, '프로세스 설명은 500자 이내로 입력해 주세요.').optional(),
  domainLabel: z.string().trim().max(80, '도메인 라벨은 80자 이내로 입력해 주세요.').optional(),
  name: z
    .string()
    .trim()
    .min(1, '프로세스 자산 이름을 입력해 주세요.')
    .max(120, '프로세스 자산 이름은 120자 이내로 입력해 주세요.'),
});

export { createProcessAssetRequestSchema };
