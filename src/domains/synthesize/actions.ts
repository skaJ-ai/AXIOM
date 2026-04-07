import { getDb } from '@/lib/db';
import type { ClaimConfidence } from '@/lib/db/schema';
import { claimSourcesTable, claimsTable } from '@/lib/db/schema';

async function createClaim(
  sessionId: string,
  content: string,
  confidence: ClaimConfidence,
): Promise<string> {
  const database = getDb();
  const rows = await database
    .insert(claimsTable)
    .values({
      confidence,
      content,
      sessionId,
    })
    .returning({ id: claimsTable.id });

  const row = rows[0];

  if (!row) {
    throw new Error('클레임 생성에 실패했습니다.');
  }

  return row.id;
}

async function linkClaimSource(
  claimId: string,
  options: {
    excerpt?: string;
    sourceId?: string;
  },
): Promise<void> {
  const database = getDb();
  await database.insert(claimSourcesTable).values({
    claimId,
    excerpt: options.excerpt ?? null,
    sourceId: options.sourceId ?? null,
  });
}

export { createClaim, linkClaimSource };
