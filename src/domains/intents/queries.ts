import { and, desc, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { intentFragmentsTable } from '@/lib/db/schema';

import type { IntentFragment } from './types';

async function listIntentFragmentsBySession(
  sessionId: string,
  workspaceId: string,
): Promise<IntentFragment[]> {
  const database = getDb();
  const rows = await database
    .select({
      confidence: intentFragmentsTable.confidence,
      content: intentFragmentsTable.content,
      createdAt: intentFragmentsTable.createdAt,
      id: intentFragmentsTable.id,
      promoted: intentFragmentsTable.promoted,
      scope: intentFragmentsTable.scope,
      speaker: intentFragmentsTable.speaker,
      type: intentFragmentsTable.type,
    })
    .from(intentFragmentsTable)
    .where(
      and(
        eq(intentFragmentsTable.sessionId, sessionId),
        eq(intentFragmentsTable.workspaceId, workspaceId),
      ),
    )
    .orderBy(desc(intentFragmentsTable.createdAt));

  return rows.map((row) => ({
    confidence: row.confidence,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    promoted: row.promoted,
    scope: row.scope,
    speaker: row.speaker,
    type: row.type,
  }));
}

export { listIntentFragmentsBySession };
