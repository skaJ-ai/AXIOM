import { eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import type { IdeaStatus } from '@/lib/db/schema';
import { clusterIdeasTable, clustersTable, ideasTable } from '@/lib/db/schema';

async function createIdea(sessionId: string, content: string, order?: number): Promise<string> {
  const database = getDb();
  const rows = await database
    .insert(ideasTable)
    .values({
      content,
      order: order ?? 0,
      sessionId,
      status: 'active',
    })
    .returning({ id: ideasTable.id });

  const row = rows[0];

  if (!row) {
    throw new Error('아이디어 생성에 실패했습니다.');
  }

  return row.id;
}

async function updateIdeaStatus(ideaId: string, status: IdeaStatus): Promise<void> {
  const database = getDb();
  await database.update(ideasTable).set({ status }).where(eq(ideasTable.id, ideaId));
}

async function createCluster(sessionId: string, label: string, summary?: string): Promise<string> {
  const database = getDb();
  const rows = await database
    .insert(clustersTable)
    .values({
      label,
      sessionId,
      summary: summary ?? null,
    })
    .returning({ id: clustersTable.id });

  const row = rows[0];

  if (!row) {
    throw new Error('클러스터 생성에 실패했습니다.');
  }

  return row.id;
}

async function mergeIdeasIntoCluster(clusterId: string, ideaIds: string[]): Promise<void> {
  const database = getDb();

  if (ideaIds.length === 0) {
    return;
  }

  await database.transaction(async (transaction) => {
    const values = ideaIds.map((ideaId) => ({
      clusterId,
      ideaId,
    }));

    await transaction.insert(clusterIdeasTable).values(values);

    for (const ideaId of ideaIds) {
      await transaction
        .update(ideasTable)
        .set({ status: 'merged' })
        .where(eq(ideasTable.id, ideaId));
    }
  });
}

export { createCluster, createIdea, mergeIdeasIntoCluster, updateIdeaStatus };
