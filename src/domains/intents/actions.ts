import { and, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { intentFragmentsTable } from '@/lib/db/schema';

import { extractIntentFragmentsFromText } from './extraction';

import type { IntentFragmentDraft } from './types';

async function createIntentFragments({
  fragments,
  messageId,
  sessionId,
  workCardId,
  workspaceId,
}: {
  fragments: IntentFragmentDraft[];
  messageId?: string | null;
  sessionId: string;
  workCardId?: string | null;
  workspaceId: string;
}): Promise<void> {
  if (fragments.length === 0) {
    return;
  }

  const database = getDb();
  await database.insert(intentFragmentsTable).values(
    fragments.map((fragment) => ({
      confidence: fragment.confidence ?? 'medium',
      content: fragment.content,
      messageId: messageId ?? null,
      scope: fragment.scope ?? null,
      sessionId,
      speaker: fragment.speaker ?? 'user',
      type: fragment.type,
      workCardId: workCardId ?? null,
      workspaceId,
    })),
  );
}

async function promoteIntentFragment(id: string, workspaceId: string): Promise<boolean> {
  const database = getDb();
  const updatedRows = await database
    .update(intentFragmentsTable)
    .set({
      promoted: true,
      promotedAt: new Date(),
    })
    .where(and(eq(intentFragmentsTable.id, id), eq(intentFragmentsTable.workspaceId, workspaceId)))
    .returning({ id: intentFragmentsTable.id });

  return updatedRows.length > 0;
}

async function captureIntentFragmentsForSessionMessage({
  content,
  messageId,
  sessionId,
  workCardId,
  workspaceId,
}: {
  content: string;
  messageId?: string | null;
  sessionId: string;
  workCardId?: string | null;
  workspaceId: string;
}): Promise<void> {
  const fragments = extractIntentFragmentsFromText(content);

  if (fragments.length === 0) {
    return;
  }

  await createIntentFragments({
    fragments,
    messageId: messageId ?? null,
    sessionId,
    workCardId: workCardId ?? null,
    workspaceId,
  });
}

export { captureIntentFragmentsForSessionMessage, createIntentFragments, promoteIntentFragment };
