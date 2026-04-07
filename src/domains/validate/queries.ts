import { asc, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { reviewsTable } from '@/lib/db/schema';

import type { Review } from './types';

async function listReviewsBySession(sessionId: string): Promise<Review[]> {
  const database = getDb();
  const rows = await database
    .select({
      category: reviewsTable.category,
      content: reviewsTable.content,
      createdAt: reviewsTable.createdAt,
      id: reviewsTable.id,
      personaName: reviewsTable.personaName,
      personaType: reviewsTable.personaType,
      sessionId: reviewsTable.sessionId,
      severity: reviewsTable.severity,
      suggestion: reviewsTable.suggestion,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.sessionId, sessionId))
    .orderBy(asc(reviewsTable.createdAt));

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
  }));
}

async function getReviewsByCategory(sessionId: string, category: string): Promise<Review[]> {
  const reviews = await listReviewsBySession(sessionId);

  return reviews.filter((review) => review.category === category);
}

export { getReviewsByCategory, listReviewsBySession };
