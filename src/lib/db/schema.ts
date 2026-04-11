import { sql } from 'drizzle-orm';
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

type DeliverableSectionConfidence = 'high' | 'medium' | 'low';
type DeliverableStatus = 'draft' | 'final' | 'promoted_asset';
type MemoryChunkKind = 'deliverable_section' | 'source';
type MemoryChunkStatus = 'active' | 'superseded';
type MessageMetadata = Record<string, unknown>;
type MessageRole = 'assistant' | 'system' | 'user';
type SessionChecklist = Record<string, boolean>;
type SessionMode = 'diverge' | 'synthesize' | 'validate' | 'write';
type SessionStatus = 'completed' | 'in_progress';
type SourceType = 'data' | 'table' | 'text';
type TemplateType = 'analysis' | 'planning' | 'result' | 'status';
type UserRole = 'admin' | 'user';

type ReportType = 'briefing' | 'operation' | 'planning';
type IdeaStatus = 'active' | 'discarded' | 'merged';
type ClaimConfidence = 'high' | 'low' | 'medium';
type ReviewCategory = 'assumption' | 'evidence_gap' | 'feasibility' | 'risk';
type ReviewSeverity = 'high' | 'low' | 'medium';
type PersonaType = 'critic' | 'custom' | 'executive' | 'field_worker' | 'union';
type EntityType = 'department' | 'person' | 'policy' | 'program' | 'project';
type FactCategory = 'headcount' | 'kpi' | 'participation' | 'progress' | 'satisfaction';
type InsightCategory = 'decision' | 'lesson' | 'recommendation' | 'risk' | 'trend';
type IntentFragmentConfidence = 'high' | 'low' | 'medium';
type IntentFragmentType =
  | 'audience'
  | 'context'
  | 'exception'
  | 'judgment_basis'
  | 'preference'
  | 'prohibition';
type ReportStatus = 'draft' | 'final' | 'promoted_asset';
type WorkCardPriority = 'high' | 'low' | 'medium';
type WorkCardSensitivity = 'confidential' | 'general' | 'restricted';
type WorkCardStatus = 'active' | 'completed' | 'paused';

interface DeliverableSection {
  cited: boolean;
  confidence: DeliverableSectionConfidence;
  content: string;
  name: string;
}

interface ReportSection {
  cited: boolean;
  confidence: ClaimConfidence;
  content: string;
  name: string;
}

const vectorColumn = customType<{
  data: number[];
  driverData: string;
}>({
  dataType() {
    return 'vector';
  },
  fromDriver(value): number[] {
    if (Array.isArray(value)) {
      return value.map((item) => Number(item));
    }

    if (typeof value !== 'string' || value.length < 2) {
      return [];
    }

    return value
      .slice(1, -1)
      .split(',')
      .filter((item) => item.length > 0)
      .map((item) => Number.parseFloat(item));
  },
  toDriver(value): string {
    return JSON.stringify(value);
  },
});

const usersTable = pgTable('users', {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  employeeNumber: text('employee_number').notNull().unique(),
  id: uuid('id').defaultRandom().primaryKey(),
  knoxId: text('knox_id').notNull().unique(),
  loginId: text('login_id').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').$type<UserRole>().default('user').notNull(),
});

const workspacesTable = pgTable(
  'workspaces',
  {
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    ownerIndex: index('idx_workspaces_owner_id').on(table.ownerId),
  }),
);

const workCardsTable = pgTable(
  'work_cards',
  {
    audience: text('audience'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    ownerId: uuid('owner_id').references(() => usersTable.id, { onDelete: 'set null' }),
    priority: text('priority').$type<WorkCardPriority>().default('medium').notNull(),
    processLabel: text('process_label'),
    sensitivity: text('sensitivity').$type<WorkCardSensitivity>().default('general').notNull(),
    status: text('status').$type<WorkCardStatus>().default('active').notNull(),
    title: text('title').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    ownerIndex: index('idx_work_cards_owner_id').on(table.ownerId),
    statusIndex: index('idx_work_cards_status').on(table.status),
    workspaceIndex: index('idx_work_cards_workspace_id').on(table.workspaceId),
  }),
);

const sessionsTable = pgTable(
  'sessions',
  {
    checklist: jsonb('checklist').$type<SessionChecklist>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    exampleText: text('example_text'),
    id: uuid('id').defaultRandom().primaryKey(),
    mode: text('mode').$type<SessionMode>().default('write').notNull(),
    parentSessionId: uuid('parent_session_id'),
    reportType: text('report_type').$type<ReportType>(),
    status: text('status').$type<SessionStatus>().default('in_progress').notNull(),
    templateType: text('template_type').$type<TemplateType>(),
    title: text('title'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    workCardId: uuid('work_card_id').references(() => workCardsTable.id, { onDelete: 'set null' }),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    modeIndex: index('idx_sessions_mode').on(table.mode),
    templateIndex: index('idx_sessions_template_type').on(table.templateType),
    workCardIndex: index('idx_sessions_work_card_id').on(table.workCardId),
    workspaceIndex: index('idx_sessions_workspace_id').on(table.workspaceId),
  }),
);

const messagesTable = pgTable(
  'messages',
  {
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    metadata: jsonb('metadata').$type<MessageMetadata>().default({}).notNull(),
    role: text('role').$type<MessageRole>().notNull(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessionsTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    messagesFtsIndex: index('idx_messages_fts').using(
      'gin',
      sql`to_tsvector('simple', ${table.content})`,
    ),
    sessionIndex: index('idx_messages_session_id').on(table.sessionId),
  }),
);

const sourcesTable = pgTable(
  'sources',
  {
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    label: text('label'),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessionsTable.id, { onDelete: 'cascade' }),
    type: text('type').$type<SourceType>(),
  },
  (table) => ({
    sessionIndex: index('idx_sources_session_id').on(table.sessionId),
  }),
);

const deliverablesTable = pgTable(
  'deliverables',
  {
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    sections: jsonb('sections').$type<DeliverableSection[]>().notNull(),
    sessionId: uuid('session_id').references(() => sessionsTable.id, { onDelete: 'set null' }),
    status: text('status').$type<DeliverableStatus>().default('draft').notNull(),
    templateType: text('template_type').$type<TemplateType>().notNull(),
    title: text('title').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    version: integer('version').default(1).notNull(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    deliverablesFtsIndex: index('idx_deliverables_fts').using(
      'gin',
      sql`to_tsvector('simple', ${table.title} || ' ' || ${table.sections}::text)`,
    ),
    sessionIndex: index('idx_deliverables_session_id').on(table.sessionId),
    workspaceIndex: index('idx_deliverables_workspace_id').on(table.workspaceId),
  }),
);

const memoryChunksTable = pgTable(
  'memory_chunks',
  {
    content: text('content').notNull(),
    contentHash: text('content_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    deliverableId: uuid('deliverable_id').references(() => deliverablesTable.id, {
      onDelete: 'cascade',
    }),
    embedding: vectorColumn('embedding').notNull(),
    embeddingModel: text('embedding_model').notNull(),
    embeddingVersion: integer('embedding_version').default(1).notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    kind: text('kind').$type<MemoryChunkKind>().notNull(),
    sectionName: text('section_name'),
    sessionId: uuid('session_id').references(() => sessionsTable.id, { onDelete: 'set null' }),
    sourceId: uuid('source_id').references(() => sourcesTable.id, { onDelete: 'cascade' }),
    status: text('status').$type<MemoryChunkStatus>().default('active').notNull(),
    templateType: text('template_type').$type<TemplateType>(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    contentHashIndex: index('idx_memory_chunks_content_hash').on(table.contentHash),
    deliverableIndex: index('idx_memory_chunks_deliverable_id').on(table.deliverableId),
    kindIndex: index('idx_memory_chunks_kind').on(table.kind),
    memoryChunksFtsIndex: index('idx_memory_chunks_fts').using(
      'gin',
      sql`to_tsvector('simple', ${table.content})`,
    ),
    sessionIndex: index('idx_memory_chunks_session_id').on(table.sessionId),
    sourceIndex: index('idx_memory_chunks_source_id').on(table.sourceId),
    statusIndex: index('idx_memory_chunks_status').on(table.status),
    templateIndex: index('idx_memory_chunks_template_type').on(table.templateType),
    workspaceStatusIndex: index('idx_memory_chunks_workspace_status').on(
      table.workspaceId,
      table.status,
    ),
  }),
);

/* ── Mode Domain Tables ── */

const ideasTable = pgTable(
  'ideas',
  {
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    order: integer('order').default(0).notNull(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessionsTable.id, { onDelete: 'cascade' }),
    status: text('status').$type<IdeaStatus>().default('active').notNull(),
  },
  (table) => ({
    sessionIndex: index('idx_ideas_session_id').on(table.sessionId),
  }),
);

const clustersTable = pgTable(
  'clusters',
  {
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    label: text('label').notNull(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessionsTable.id, { onDelete: 'cascade' }),
    summary: text('summary'),
  },
  (table) => ({
    sessionIndex: index('idx_clusters_session_id').on(table.sessionId),
  }),
);

const clusterIdeasTable = pgTable(
  'cluster_ideas',
  {
    clusterId: uuid('cluster_id')
      .notNull()
      .references(() => clustersTable.id, { onDelete: 'cascade' }),
    ideaId: uuid('idea_id')
      .notNull()
      .references(() => ideasTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    clusterIndex: index('idx_cluster_ideas_cluster_id').on(table.clusterId),
    ideaIndex: index('idx_cluster_ideas_idea_id').on(table.ideaId),
  }),
);

const claimsTable = pgTable(
  'claims',
  {
    confidence: text('confidence').$type<ClaimConfidence>().default('medium').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessionsTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    sessionIndex: index('idx_claims_session_id').on(table.sessionId),
  }),
);

const claimSourcesTable = pgTable(
  'claim_sources',
  {
    claimId: uuid('claim_id')
      .notNull()
      .references(() => claimsTable.id, { onDelete: 'cascade' }),
    excerpt: text('excerpt'),
    sourceId: uuid('source_id').references(() => sourcesTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    claimIndex: index('idx_claim_sources_claim_id').on(table.claimId),
    sourceIndex: index('idx_claim_sources_source_id').on(table.sourceId),
  }),
);

const reviewsTable = pgTable(
  'reviews',
  {
    category: text('category').$type<ReviewCategory>().notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    personaName: text('persona_name').notNull(),
    personaType: text('persona_type').$type<PersonaType>().default('critic').notNull(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessionsTable.id, { onDelete: 'cascade' }),
    severity: text('severity').$type<ReviewSeverity>().default('medium').notNull(),
    suggestion: text('suggestion'),
  },
  (table) => ({
    sessionIndex: index('idx_reviews_session_id').on(table.sessionId),
  }),
);

const intentFragmentsTable = pgTable(
  'intent_fragments',
  {
    confidence: text('confidence').$type<IntentFragmentConfidence>().default('medium').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    messageId: uuid('message_id').references(() => messagesTable.id, { onDelete: 'set null' }),
    promoted: boolean('promoted').default(false).notNull(),
    promotedAt: timestamp('promoted_at', { withTimezone: true }),
    scope: text('scope'),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessionsTable.id, { onDelete: 'cascade' }),
    speaker: text('speaker'),
    type: text('type').$type<IntentFragmentType>().notNull(),
    workCardId: uuid('work_card_id').references(() => workCardsTable.id, { onDelete: 'set null' }),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    messageIndex: index('idx_intent_fragments_message_id').on(table.messageId),
    promotedIndex: index('idx_intent_fragments_promoted').on(table.promoted),
    sessionIndex: index('idx_intent_fragments_session_id').on(table.sessionId),
    typeIndex: index('idx_intent_fragments_type').on(table.type),
    workCardIndex: index('idx_intent_fragments_work_card_id').on(table.workCardId),
    workspaceIndex: index('idx_intent_fragments_workspace_id').on(table.workspaceId),
  }),
);

const reportsTable = pgTable(
  'reports',
  {
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    reportType: text('report_type').$type<ReportType>().notNull(),
    sections: jsonb('sections').$type<ReportSection[]>().notNull(),
    sessionId: uuid('session_id').references(() => sessionsTable.id, { onDelete: 'set null' }),
    status: text('status').$type<ReportStatus>().default('draft').notNull(),
    title: text('title').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    version: integer('version').default(1).notNull(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    sessionIndex: index('idx_reports_session_id').on(table.sessionId),
    workspaceIndex: index('idx_reports_workspace_id').on(table.workspaceId),
  }),
);

/* ── Knowledge Tables ── */

const entitiesTable = pgTable(
  'entities',
  {
    aliases: jsonb('aliases').$type<string[]>().default([]).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).defaultNow().notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
    name: text('name').notNull(),
    type: text('type').$type<EntityType>().notNull(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    nameIndex: index('idx_entities_name').on(table.name),
    workspaceIndex: index('idx_entities_workspace_id').on(table.workspaceId),
  }),
);

const factsTable = pgTable(
  'facts',
  {
    category: text('category').$type<FactCategory>().notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    entityId: uuid('entity_id')
      .notNull()
      .references(() => entitiesTable.id, { onDelete: 'cascade' }),
    id: uuid('id').defaultRandom().primaryKey(),
    numericValue: text('numeric_value'),
    periodLabel: text('period_label'),
    sourceReportId: uuid('source_report_id').references(() => reportsTable.id, {
      onDelete: 'set null',
    }),
    unit: text('unit'),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    entityIndex: index('idx_facts_entity_id').on(table.entityId),
    workspaceIndex: index('idx_facts_workspace_id').on(table.workspaceId),
  }),
);

const insightsTable = pgTable(
  'insights',
  {
    category: text('category').$type<InsightCategory>().notNull(),
    confidence: text('confidence').$type<ClaimConfidence>().default('medium').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    id: uuid('id').defaultRandom().primaryKey(),
    sourceReportId: uuid('source_report_id').references(() => reportsTable.id, {
      onDelete: 'set null',
    }),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    workspaceIndex: index('idx_insights_workspace_id').on(table.workspaceId),
  }),
);

const entityInsightsTable = pgTable(
  'entity_insights',
  {
    entityId: uuid('entity_id')
      .notNull()
      .references(() => entitiesTable.id, { onDelete: 'cascade' }),
    insightId: uuid('insight_id')
      .notNull()
      .references(() => insightsTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    entityIndex: index('idx_entity_insights_entity_id').on(table.entityId),
    insightIndex: index('idx_entity_insights_insight_id').on(table.insightId),
  }),
);

export {
  claimSourcesTable,
  claimsTable,
  clusterIdeasTable,
  clustersTable,
  deliverablesTable,
  entitiesTable,
  entityInsightsTable,
  factsTable,
  ideasTable,
  insightsTable,
  intentFragmentsTable,
  memoryChunksTable,
  messagesTable,
  reportsTable,
  reviewsTable,
  sessionsTable,
  sourcesTable,
  usersTable,
  workCardsTable,
  workspacesTable,
};
export type {
  ClaimConfidence,
  DeliverableSection,
  DeliverableStatus,
  EntityType,
  FactCategory,
  IdeaStatus,
  InsightCategory,
  IntentFragmentConfidence,
  IntentFragmentType,
  MemoryChunkKind,
  MemoryChunkStatus,
  PersonaType,
  ReportSection,
  ReportStatus,
  ReportType,
  ReviewCategory,
  ReviewSeverity,
  SessionChecklist,
  SessionMode,
  SessionStatus,
  SourceType,
  TemplateType,
  UserRole,
  WorkCardPriority,
  WorkCardSensitivity,
  WorkCardStatus,
};
