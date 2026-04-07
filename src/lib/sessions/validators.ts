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
});

const createWriteSessionRequestSchema = createSessionBaseSchema.extend({
  mode: z.literal('write'),
  reportType: z.enum(REPORT_TYPES),
});

const createNonWriteSessionRequestSchema = createSessionBaseSchema.extend({
  mode: z.enum(NON_WRITE_SESSION_MODES),
  reportType: z.enum(REPORT_TYPES).optional(),
});

const createSessionRequestSchema = z.discriminatedUnion('mode', [
  createWriteSessionRequestSchema,
  createNonWriteSessionRequestSchema,
]);

const createSourceRequestSchema = z.object({
  content: z.string().trim().min(1, '근거자료 내용은 입력해 주세요.'),
  label: z.string().trim().optional(),
  type: z.enum(['text', 'table', 'data']).optional(),
});

export { EXAMPLE_TEXT_MAX_LENGTH, createSessionRequestSchema, createSourceRequestSchema };
