import { z } from 'zod';

const EXAMPLE_TEXT_MAX_LENGTH = 5000;
const NON_WRITE_SESSION_MODES = ['diverge', 'validate', 'synthesize'] as const;
const REPORT_TYPES = ['operation', 'planning', 'briefing'] as const;
const TEMPLATE_TYPES = ['analysis', 'planning', 'result', 'status'] as const;

const createSessionBaseSchema = z.object({
  exampleText: z
    .string()
    .trim()
    .max(EXAMPLE_TEXT_MAX_LENGTH, `예시 문서는 ${EXAMPLE_TEXT_MAX_LENGTH}자 이내로 입력해 주세요.`)
    .optional(),
  parentSessionId: z.string().uuid().optional(),
  templateType: z.enum(TEMPLATE_TYPES).optional(),
  workCardAudience: z
    .string()
    .trim()
    .max(120, '대상 독자는 120자 이내로 입력해 주세요.')
    .optional(),
  workCardId: z.string().uuid().optional(),
  workCardProcessLabel: z
    .string()
    .trim()
    .max(120, '프로세스 라벨은 120자 이내로 입력해 주세요.')
    .optional(),
  workCardTitle: z
    .string()
    .trim()
    .max(160, '업무 카드 제목은 160자 이내로 입력해 주세요.')
    .optional(),
});

const createWriteSessionRequestSchema = createSessionBaseSchema.extend({
  mode: z.literal('write'),
  reportType: z.enum(REPORT_TYPES),
});

const createNonWriteSessionRequestSchema = createSessionBaseSchema.extend({
  mode: z.enum(NON_WRITE_SESSION_MODES),
  reportType: z.enum(REPORT_TYPES).optional(),
});

const createSessionRequestSchema = z
  .discriminatedUnion('mode', [createWriteSessionRequestSchema, createNonWriteSessionRequestSchema])
  .superRefine((value, context) => {
    const hasExistingWorkCard =
      typeof value.workCardId === 'string' && value.workCardId.trim().length > 0;
    const hasNewWorkCardTitle =
      typeof value.workCardTitle === 'string' && value.workCardTitle.trim().length > 0;
    const hasNewWorkCardMetadata =
      (typeof value.workCardAudience === 'string' && value.workCardAudience.trim().length > 0) ||
      (typeof value.workCardProcessLabel === 'string' &&
        value.workCardProcessLabel.trim().length > 0);

    if (hasExistingWorkCard && (hasNewWorkCardTitle || hasNewWorkCardMetadata)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: '기존 업무 카드를 선택했으면 새 업무 카드 입력칸은 비워 두세요.',
        path: ['workCardId'],
      });
    }

    if (hasNewWorkCardMetadata && !hasNewWorkCardTitle) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: '대상 독자나 프로세스 라벨을 입력했다면 업무 카드 제목도 입력해 주세요.',
        path: ['workCardTitle'],
      });
    }
  });

const createSourceRequestSchema = z.object({
  content: z.string().trim().min(1, '근거 자료 내용은 입력해 주세요.'),
  label: z.string().trim().optional(),
  type: z.enum(['text', 'table', 'data']).optional(),
});

export { EXAMPLE_TEXT_MAX_LENGTH, createSessionRequestSchema, createSourceRequestSchema };
