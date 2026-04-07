import { asc, desc, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { entitiesTable, entityInsightsTable, factsTable, insightsTable } from '@/lib/db/schema';

import type { Entity, EntityWithFacts, Fact, Insight } from './types';

async function listEntities(workspaceId: string): Promise<Entity[]> {
  const database = getDb();
  const rows = await database
    .select()
    .from(entitiesTable)
    .where(eq(entitiesTable.workspaceId, workspaceId))
    .orderBy(asc(entitiesTable.name));

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    firstSeenAt: row.firstSeenAt.toISOString(),
    lastSeenAt: row.lastSeenAt.toISOString(),
  }));
}

async function getEntityDetail(
  entityId: string,
  workspaceId: string,
): Promise<EntityWithFacts | null> {
  const database = getDb();
  const entityRows = await database
    .select()
    .from(entitiesTable)
    .where(eq(entitiesTable.id, entityId))
    .limit(1);

  const entity = entityRows[0];

  if (!entity || entity.workspaceId !== workspaceId) {
    return null;
  }

  const [factRows, insightJoins] = await Promise.all([
    database
      .select()
      .from(factsTable)
      .where(eq(factsTable.entityId, entityId))
      .orderBy(desc(factsTable.createdAt)),
    database
      .select({ insightId: entityInsightsTable.insightId })
      .from(entityInsightsTable)
      .where(eq(entityInsightsTable.entityId, entityId)),
  ]);

  return {
    ...entity,
    createdAt: entity.createdAt.toISOString(),
    factCount: factRows.length,
    facts: factRows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })),
    firstSeenAt: entity.firstSeenAt.toISOString(),
    insightCount: insightJoins.length,
    lastSeenAt: entity.lastSeenAt.toISOString(),
  };
}

async function listFacts(workspaceId: string): Promise<Fact[]> {
  const database = getDb();
  const rows = await database
    .select()
    .from(factsTable)
    .where(eq(factsTable.workspaceId, workspaceId))
    .orderBy(desc(factsTable.createdAt));

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
  }));
}

async function listInsights(workspaceId: string): Promise<Insight[]> {
  const database = getDb();
  const rows = await database
    .select()
    .from(insightsTable)
    .where(eq(insightsTable.workspaceId, workspaceId))
    .orderBy(desc(insightsTable.createdAt));

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
  }));
}

async function searchKnowledge(
  workspaceId: string,
  query: string,
): Promise<{ entities: Entity[]; facts: Fact[]; insights: Insight[] }> {
  const entities = await listEntities(workspaceId);
  const facts = await listFacts(workspaceId);
  const insights = await listInsights(workspaceId);
  const lowerQuery = query.toLowerCase();

  return {
    entities: entities.filter(
      (entity) =>
        entity.name.toLowerCase().includes(lowerQuery) ||
        entity.aliases.some((alias) => alias.toLowerCase().includes(lowerQuery)),
    ),
    facts: facts.filter((fact) => fact.content.toLowerCase().includes(lowerQuery)),
    insights: insights.filter((insight) => insight.content.toLowerCase().includes(lowerQuery)),
  };
}

export { getEntityDetail, listEntities, listFacts, listInsights, searchKnowledge };
