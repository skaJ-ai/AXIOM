import { asc, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { clusterIdeasTable, clustersTable, ideasTable } from '@/lib/db/schema';

import type { ClusterWithIdeas, Idea } from './types';

async function listIdeasBySession(sessionId: string): Promise<Idea[]> {
  const database = getDb();
  const rows = await database
    .select({
      content: ideasTable.content,
      createdAt: ideasTable.createdAt,
      id: ideasTable.id,
      order: ideasTable.order,
      sessionId: ideasTable.sessionId,
      status: ideasTable.status,
    })
    .from(ideasTable)
    .where(eq(ideasTable.sessionId, sessionId))
    .orderBy(asc(ideasTable.order));

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
  }));
}

async function listClustersBySession(sessionId: string): Promise<ClusterWithIdeas[]> {
  const database = getDb();
  const clusterRows = await database
    .select({
      createdAt: clustersTable.createdAt,
      id: clustersTable.id,
      label: clustersTable.label,
      sessionId: clustersTable.sessionId,
      summary: clustersTable.summary,
    })
    .from(clustersTable)
    .where(eq(clustersTable.sessionId, sessionId))
    .orderBy(asc(clustersTable.createdAt));

  const results: ClusterWithIdeas[] = [];

  for (const cluster of clusterRows) {
    const ideaJoins = await database
      .select({
        content: ideasTable.content,
        createdAt: ideasTable.createdAt,
        id: ideasTable.id,
        order: ideasTable.order,
        sessionId: ideasTable.sessionId,
        status: ideasTable.status,
      })
      .from(clusterIdeasTable)
      .innerJoin(ideasTable, eq(clusterIdeasTable.ideaId, ideasTable.id))
      .where(eq(clusterIdeasTable.clusterId, cluster.id));

    results.push({
      ...cluster,
      createdAt: cluster.createdAt.toISOString(),
      ideas: ideaJoins.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  }

  return results;
}

export { listClustersBySession, listIdeasBySession };
