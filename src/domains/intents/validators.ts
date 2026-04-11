import { z } from 'zod';

const reviewIntentRequestSchema = z.object({
  decision: z.enum(['approve', 'reject', 'reset']),
});

export { reviewIntentRequestSchema };
