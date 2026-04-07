import { asc, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { claimSourcesTable, claimsTable } from '@/lib/db/schema';

import type { ClaimWithSources } from './types';

async function listClaimsBySession(sessionId: string): Promise<ClaimWithSources[]> {
  const database = getDb();
  const claimRows = await database
    .select({
      confidence: claimsTable.confidence,
      content: claimsTable.content,
      createdAt: claimsTable.createdAt,
      id: claimsTable.id,
      sessionId: claimsTable.sessionId,
    })
    .from(claimsTable)
    .where(eq(claimsTable.sessionId, sessionId))
    .orderBy(asc(claimsTable.createdAt));

  const results: ClaimWithSources[] = [];

  for (const claim of claimRows) {
    const sourceRows = await database
      .select({
        excerpt: claimSourcesTable.excerpt,
        sourceId: claimSourcesTable.sourceId,
      })
      .from(claimSourcesTable)
      .where(eq(claimSourcesTable.claimId, claim.id));

    results.push({
      ...claim,
      createdAt: claim.createdAt.toISOString(),
      sources: sourceRows,
    });
  }

  return results;
}

export { listClaimsBySession };
