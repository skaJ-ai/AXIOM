import { z } from 'zod';

const WORK_CARD_PRIORITIES = ['high', 'low', 'medium'] as const;
const WORK_CARD_SENSITIVITIES = ['confidential', 'general', 'restricted'] as const;
const WORK_CARD_STATUSES = ['active', 'archived', 'completed', 'paused'] as const;

const createWorkCardRequestSchema = z.object({
  audience: z.string().trim().max(120, '대상 독자는 120자 이내로 입력해 주세요.').optional(),
  processLabel: z
    .string()
    .trim()
    .max(120, '프로세스 라벨은 120자 이내로 입력해 주세요.')
    .optional(),
  title: z
    .string()
    .trim()
    .min(1, '업무 카드 제목은 입력해 주세요.')
    .max(160, '업무 카드 제목은 160자 이내로 입력해 주세요.'),
});

const updateWorkCardRequestSchema = z
  .object({
    audience: z
      .string()
      .trim()
      .max(120, '대상 독자는 120자 이내로 입력해 주세요.')
      .nullable()
      .optional(),
    priority: z.enum(WORK_CARD_PRIORITIES).optional(),
    processLabel: z
      .string()
      .trim()
      .max(120, '프로세스 라벨은 120자 이내로 입력해 주세요.')
      .nullable()
      .optional(),
    sensitivity: z.enum(WORK_CARD_SENSITIVITIES).optional(),
    status: z.enum(WORK_CARD_STATUSES).optional(),
    title: z
      .string()
      .trim()
      .min(1, '업무 카드 제목은 입력해 주세요.')
      .max(160, '업무 카드 제목은 160자 이내로 입력해 주세요.')
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: '업데이트할 업무 카드 항목을 하나 이상 보내 주세요.',
  });

export { createWorkCardRequestSchema, updateWorkCardRequestSchema };
