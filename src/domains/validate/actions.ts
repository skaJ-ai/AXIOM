import { getDb } from '@/lib/db';
import type { PersonaType, ReviewCategory, ReviewSeverity } from '@/lib/db/schema';
import { reviewsTable } from '@/lib/db/schema';

async function createReview({
  category,
  content,
  personaName,
  personaType,
  sessionId,
  severity,
  suggestion,
}: {
  category: ReviewCategory;
  content: string;
  personaName: string;
  personaType: PersonaType;
  sessionId: string;
  severity: ReviewSeverity;
  suggestion?: string;
}): Promise<string> {
  const database = getDb();
  const rows = await database
    .insert(reviewsTable)
    .values({
      category,
      content,
      personaName,
      personaType,
      sessionId,
      severity,
      suggestion: suggestion ?? null,
    })
    .returning({ id: reviewsTable.id });

  const row = rows[0];

  if (!row) {
    throw new Error('리뷰 생성에 실패했습니다.');
  }

  return row.id;
}

export { createReview };
