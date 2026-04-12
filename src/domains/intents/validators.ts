import { z } from 'zod';

const reviewIntentRequestSchema = z.object({
  decision: z.enum(['approve', 'reject', 'reset']),
});

const batchReviewIntentRequestSchema = z.object({
  action: z.enum(['approve', 'nominate', 'reject', 'reset']),
  intentIds: z.array(z.string().min(1)).min(1).max(100),
});

export { batchReviewIntentRequestSchema, reviewIntentRequestSchema };
