import { getDb } from '@/lib/db';
import { workCardsTable } from '@/lib/db/schema';

import type { WorkCardSummary } from './types';

async function createWorkCard({
  audience,
  database,
  ownerId,
  processLabel,
  title,
  workspaceId,
}: {
  audience?: string;
  database?: ReturnType<typeof getDb>;
  ownerId?: string;
  processLabel?: string;
  title: string;
  workspaceId: string;
}): Promise<WorkCardSummary> {
  const client = database ?? getDb();
  const createdCards = await client
    .insert(workCardsTable)
    .values({
      audience: audience?.trim() ? audience.trim() : null,
      ownerId: ownerId ?? null,
      processLabel: processLabel?.trim() ? processLabel.trim() : null,
      title: title.trim(),
      workspaceId,
    })
    .returning({
      audience: workCardsTable.audience,
      id: workCardsTable.id,
      priority: workCardsTable.priority,
      processLabel: workCardsTable.processLabel,
      sensitivity: workCardsTable.sensitivity,
      status: workCardsTable.status,
      title: workCardsTable.title,
    });

  const createdCard = createdCards[0];

  if (!createdCard) {
    throw new Error('업무 카드를 생성하지 못했습니다.');
  }

  return createdCard;
}

export { createWorkCard };
