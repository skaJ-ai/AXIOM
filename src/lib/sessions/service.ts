import { and, asc, desc, eq, sql } from 'drizzle-orm';

import { mergeCanvasState } from '@/lib/ai/session-chat';
import { getDb } from '@/lib/db';
import type {
  ReportType,
  SessionChecklist,
  SessionMode,
  SourceType,
  TemplateType,
} from '@/lib/db/schema';
import { messagesTable, sessionsTable, sourcesTable } from '@/lib/db/schema';
import {
  getLatestDeliverableSummaryForSession,
  listRecentReferenceDeliverablesByTemplate,
} from '@/lib/deliverables/service';
import { safeReplaceMemoryChunksForSource } from '@/lib/memory/service';
import { createInitialModeChecklist, getModeByType } from '@/lib/modes';
import { getTemplateByType } from '@/lib/templates';

import type {
  SessionDetail,
  SessionMessageMetadata,
  SessionModeSummary,
  SessionSummary,
  SessionTemplateSummary,
} from './types';

function createSessionModeSummary(mode: SessionMode): SessionModeSummary {
  const modeDefinition = getModeByType(mode);

  return {
    badge: modeDefinition.badge,
    checklist: modeDefinition.checklist,
    description: modeDefinition.description,
    icon: modeDefinition.icon,
    mode: modeDefinition.mode,
    name: modeDefinition.name,
  };
}

function createSessionTemplateSummary(templateType: TemplateType): SessionTemplateSummary {
  const template = getTemplateByType(templateType);

  return {
    badge: template.badge,
    checklist: template.checklist,
    description: template.description,
    estimatedMinutes: template.estimatedMinutes,
    exampleTags: template.exampleTags,
    methodologyMap: template.methodologyMap,
    name: template.name,
    sections: template.sections,
    type: template.type,
  };
}

function createSessionSummary({
  checklist,
  createdAt,
  id,
  messageCount,
  mode,
  parentSessionId,
  sourceCount,
  status,
  templateType,
  title,
  updatedAt,
}: {
  checklist: SessionChecklist;
  createdAt: Date;
  id: string;
  messageCount: number;
  mode: SessionMode;
  parentSessionId: string | null;
  sourceCount: number;
  status: 'completed' | 'in_progress';
  templateType: TemplateType | null;
  title: string | null;
  updatedAt: Date;
}): SessionSummary {
  const modeSummary = createSessionModeSummary(mode);
  const template = templateType ? createSessionTemplateSummary(templateType) : null;

  return {
    checklist,
    createdAt: createdAt.toISOString(),
    id,
    messageCount,
    mode,
    modeSummary,
    parentSessionId,
    sourceCount,
    status,
    template,
    title: title ?? modeSummary.name,
    updatedAt: updatedAt.toISOString(),
  };
}

function calculateReadinessPercent(
  checklist: SessionChecklist,
  mode: SessionMode,
  templateType: TemplateType | null,
): number {
  const modeChecklist = getModeByType(mode).checklist;
  const checklistItems =
    templateType && mode === 'write' ? getTemplateByType(templateType).checklist : modeChecklist;
  const totalWeight = checklistItems.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = checklistItems
    .filter((item) => checklist[item.id] === true)
    .reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round((completedWeight / totalWeight) * 100);
}

function parseSessionMessageMetadata(metadata: Record<string, unknown>): SessionMessageMetadata {
  return {
    canvas:
      typeof metadata.canvas === 'object' && metadata.canvas !== null
        ? (metadata.canvas as SessionMessageMetadata['canvas'])
        : undefined,
    checklist:
      typeof metadata.checklist === 'object' && metadata.checklist !== null
        ? (metadata.checklist as SessionChecklist)
        : undefined,
    uiMessageId: typeof metadata.uiMessageId === 'string' ? metadata.uiMessageId : undefined,
  };
}

async function createSessionForWorkspace(
  workspaceId: string,
  mode: SessionMode,
  options?: {
    exampleText?: string;
    parentSessionId?: string;
    reportType?: ReportType;
    templateType?: TemplateType;
  },
): Promise<SessionSummary> {
  const database = getDb();
  const modeDefinition = getModeByType(mode);
  const initialChecklist = createInitialModeChecklist(mode);

  return database.transaction(async (transaction) => {
    const createdSessions = await transaction
      .insert(sessionsTable)
      .values({
        checklist: initialChecklist,
        exampleText: options?.exampleText ?? null,
        mode,
        parentSessionId: options?.parentSessionId ?? null,
        reportType: options?.reportType ?? null,
        templateType: options?.templateType ?? null,
        title: modeDefinition.name,
        workspaceId,
      })
      .returning({
        checklist: sessionsTable.checklist,
        createdAt: sessionsTable.createdAt,
        id: sessionsTable.id,
        mode: sessionsTable.mode,
        parentSessionId: sessionsTable.parentSessionId,
        status: sessionsTable.status,
        templateType: sessionsTable.templateType,
        title: sessionsTable.title,
        updatedAt: sessionsTable.updatedAt,
      });

    const createdSession = createdSessions[0];

    if (!createdSession) {
      throw new Error('세션 생성에 실패했습니다.');
    }

    await transaction.insert(messagesTable).values({
      content: modeDefinition.starterMessage,
      metadata: {},
      role: 'assistant',
      sessionId: createdSession.id,
    });

    return createSessionSummary({
      checklist: createdSession.checklist,
      createdAt: createdSession.createdAt,
      id: createdSession.id,
      messageCount: 1,
      mode: createdSession.mode,
      parentSessionId: createdSession.parentSessionId,
      sourceCount: 0,
      status: createdSession.status,
      templateType: createdSession.templateType,
      title: createdSession.title,
      updatedAt: createdSession.updatedAt,
    });
  });
}

async function listSessionsByWorkspace(workspaceId: string): Promise<SessionSummary[]> {
  const database = getDb();
  const sessionRows = await database
    .select({
      checklist: sessionsTable.checklist,
      createdAt: sessionsTable.createdAt,
      id: sessionsTable.id,
      messageCount: sql<number>`(
        select count(*)::int
        from ${messagesTable}
        where ${messagesTable.sessionId} = ${sessionsTable.id}
      )`,
      mode: sessionsTable.mode,
      parentSessionId: sessionsTable.parentSessionId,
      sourceCount: sql<number>`(
        select count(*)::int
        from ${sourcesTable}
        where ${sourcesTable.sessionId} = ${sessionsTable.id}
      )`,
      status: sessionsTable.status,
      templateType: sessionsTable.templateType,
      title: sessionsTable.title,
      updatedAt: sessionsTable.updatedAt,
    })
    .from(sessionsTable)
    .where(eq(sessionsTable.workspaceId, workspaceId))
    .orderBy(desc(sessionsTable.updatedAt));

  return sessionRows.map((sessionRow) =>
    createSessionSummary({
      checklist: sessionRow.checklist,
      createdAt: sessionRow.createdAt,
      id: sessionRow.id,
      messageCount: sessionRow.messageCount,
      mode: sessionRow.mode,
      parentSessionId: sessionRow.parentSessionId,
      sourceCount: sessionRow.sourceCount,
      status: sessionRow.status,
      templateType: sessionRow.templateType,
      title: sessionRow.title,
      updatedAt: sessionRow.updatedAt,
    }),
  );
}

async function verifySessionOwnership(sessionId: string, workspaceId: string): Promise<boolean> {
  const database = getDb();
  const rows = await database
    .select({ id: sessionsTable.id })
    .from(sessionsTable)
    .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.workspaceId, workspaceId)))
    .limit(1);

  return rows.length > 0;
}

async function getSessionDetailForWorkspace(
  sessionId: string,
  workspaceId: string,
): Promise<SessionDetail | null> {
  const database = getDb();
  const sessionRows = await database
    .select({
      checklist: sessionsTable.checklist,
      createdAt: sessionsTable.createdAt,
      exampleText: sessionsTable.exampleText,
      id: sessionsTable.id,
      mode: sessionsTable.mode,
      parentSessionId: sessionsTable.parentSessionId,
      status: sessionsTable.status,
      templateType: sessionsTable.templateType,
      title: sessionsTable.title,
      updatedAt: sessionsTable.updatedAt,
    })
    .from(sessionsTable)
    .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.workspaceId, workspaceId)))
    .limit(1);

  const sessionRow = sessionRows[0];

  if (!sessionRow) {
    return null;
  }

  const [messageRows, sourceRows, latestDeliverable, recentReferences] = await Promise.all([
    database
      .select({
        content: messagesTable.content,
        createdAt: messagesTable.createdAt,
        id: messagesTable.id,
        metadata: messagesTable.metadata,
        role: messagesTable.role,
      })
      .from(messagesTable)
      .where(eq(messagesTable.sessionId, sessionId))
      .orderBy(asc(messagesTable.createdAt)),
    database
      .select({
        content: sourcesTable.content,
        createdAt: sourcesTable.createdAt,
        id: sourcesTable.id,
        label: sourcesTable.label,
        type: sourcesTable.type,
      })
      .from(sourcesTable)
      .where(eq(sourcesTable.sessionId, sessionId))
      .orderBy(desc(sourcesTable.createdAt)),
    getLatestDeliverableSummaryForSession(sessionId, workspaceId),
    sessionRow.templateType
      ? listRecentReferenceDeliverablesByTemplate({
          excludeSessionId: sessionId,
          limit: 3,
          templateType: sessionRow.templateType,
          workspaceId,
        })
      : Promise.resolve([]),
  ]);

  const latestAssistantMetadata = [...messageRows]
    .reverse()
    .find(
      (messageRow) =>
        messageRow.role === 'assistant' && Object.keys(messageRow.metadata).length > 0,
    );
  const parsedMetadata = latestAssistantMetadata
    ? parseSessionMessageMetadata(latestAssistantMetadata.metadata)
    : {};
  const summary = createSessionSummary({
    checklist: sessionRow.checklist,
    createdAt: sessionRow.createdAt,
    id: sessionRow.id,
    messageCount: messageRows.length,
    mode: sessionRow.mode,
    parentSessionId: sessionRow.parentSessionId,
    sourceCount: sourceRows.length,
    status: sessionRow.status,
    templateType: sessionRow.templateType,
    title: sessionRow.title,
    updatedAt: sessionRow.updatedAt,
  });
  const checklist = parsedMetadata.checklist ?? summary.checklist;
  const readinessPercent = calculateReadinessPercent(
    checklist,
    sessionRow.mode,
    sessionRow.templateType,
  );

  const canvasState =
    sessionRow.mode === 'write' && sessionRow.templateType
      ? mergeCanvasState(sessionRow.templateType, parsedMetadata.canvas ?? null)
      : {
          methodologySuggestions: [],
          sections: [],
          title: summary.title,
        };

  return {
    ...summary,
    canGenerate: sessionRow.mode === 'write' && Object.values(checklist).every((value) => value),
    canvas: canvasState,
    checklist,
    exampleText: sessionRow.exampleText,
    latestDeliverable,
    messages: messageRows.map((messageRow) => {
      const metadata = parseSessionMessageMetadata(messageRow.metadata);

      return {
        content: messageRow.content,
        createdAt: messageRow.createdAt.toISOString(),
        id: metadata.uiMessageId ?? messageRow.id,
        role: messageRow.role,
      };
    }),
    panelData: null,
    readinessPercent,
    recentReferences,
    sources: sourceRows.map((sourceRow) => ({
      content: sourceRow.content,
      createdAt: sourceRow.createdAt.toISOString(),
      id: sourceRow.id,
      label: sourceRow.label,
      type: sourceRow.type,
    })),
  };
}

async function createSourceForSession({
  content,
  label,
  sessionId,
  type,
  workspaceId,
}: {
  content: string;
  label?: string;
  sessionId: string;
  type?: SourceType;
  workspaceId: string;
}): Promise<void> {
  const database = getDb();
  const sessionExists = await database
    .select({ id: sessionsTable.id })
    .from(sessionsTable)
    .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.workspaceId, workspaceId)))
    .limit(1);

  if (!sessionExists[0]) {
    throw new Error('세션을 찾을 수 없습니다.');
  }

  const createdSourceId = await database.transaction(async (transaction) => {
    const createdSources = await transaction
      .insert(sourcesTable)
      .values({
        content,
        label: label?.trim() ? label.trim() : null,
        sessionId,
        type: type ?? 'text',
      })
      .returning({
        id: sourcesTable.id,
      });
    const createdSource = createdSources[0];

    await transaction
      .update(sessionsTable)
      .set({
        updatedAt: sql`now()`,
      })
      .where(eq(sessionsTable.id, sessionId));

    return createdSource?.id ?? null;
  });

  if (createdSourceId) {
    void safeReplaceMemoryChunksForSource(createdSourceId);
  }
}

async function createUserMessageForSession({
  content,
  sessionId,
  uiMessageId,
  workspaceId,
}: {
  content: string;
  sessionId: string;
  uiMessageId?: string;
  workspaceId: string;
}): Promise<void> {
  const database = getDb();
  const sessionExists = await database
    .select({ id: sessionsTable.id })
    .from(sessionsTable)
    .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.workspaceId, workspaceId)))
    .limit(1);

  if (!sessionExists[0]) {
    throw new Error('세션을 찾을 수 없습니다.');
  }

  await database.transaction(async (transaction) => {
    await transaction.insert(messagesTable).values({
      content,
      metadata: {
        uiMessageId,
      },
      role: 'user',
      sessionId,
    });

    await transaction
      .update(sessionsTable)
      .set({
        updatedAt: sql`now()`,
      })
      .where(eq(sessionsTable.id, sessionId));
  });
}

async function createAssistantMessageForSession({
  canvas,
  checklist,
  content,
  sessionId,
  uiMessageId,
  workspaceId,
}: {
  canvas: SessionMessageMetadata['canvas'];
  checklist: SessionChecklist;
  content: string;
  sessionId: string;
  uiMessageId?: string;
  workspaceId: string;
}): Promise<void> {
  const database = getDb();

  await database.transaction(async (transaction) => {
    const sessionExists = await transaction
      .select({ id: sessionsTable.id })
      .from(sessionsTable)
      .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.workspaceId, workspaceId)))
      .limit(1);

    if (!sessionExists[0]) {
      throw new Error('세션을 찾을 수 없습니다.');
    }

    await transaction.insert(messagesTable).values({
      content,
      metadata: {
        canvas,
        checklist,
        uiMessageId,
      },
      role: 'assistant',
      sessionId,
    });

    await transaction
      .update(sessionsTable)
      .set({
        checklist,
        updatedAt: sql`now()`,
      })
      .where(eq(sessionsTable.id, sessionId));
  });
}

async function getSessionPromptContext({
  sessionId,
  workspaceId,
}: {
  sessionId: string;
  workspaceId: string;
}): Promise<{
  checklist: SessionChecklist;
  exampleText: string | null;
  messages: { content: string; role: 'assistant' | 'system' | 'user' }[];
  mode: SessionMode;
  recentDeliverables: {
    summary: string;
    title: string;
  }[];
  sources: {
    content: string;
    label: string | null;
    type: string | null;
  }[];
  templateType: TemplateType | null;
}> {
  const database = getDb();
  const sessionRows = await database
    .select({
      checklist: sessionsTable.checklist,
      exampleText: sessionsTable.exampleText,
      id: sessionsTable.id,
      mode: sessionsTable.mode,
      templateType: sessionsTable.templateType,
    })
    .from(sessionsTable)
    .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.workspaceId, workspaceId)))
    .limit(1);

  const sessionRow = sessionRows[0];

  if (!sessionRow) {
    throw new Error('세션을 찾을 수 없습니다.');
  }

  const [messageRows, sourceRows, recentDeliverables] = await Promise.all([
    database
      .select({
        content: messagesTable.content,
        role: messagesTable.role,
      })
      .from(messagesTable)
      .where(eq(messagesTable.sessionId, sessionId))
      .orderBy(asc(messagesTable.createdAt)),
    database
      .select({
        content: sourcesTable.content,
        label: sourcesTable.label,
        type: sourcesTable.type,
      })
      .from(sourcesTable)
      .where(eq(sourcesTable.sessionId, sessionId))
      .orderBy(desc(sourcesTable.createdAt)),
    sessionRow.templateType
      ? listRecentReferenceDeliverablesByTemplate({
          excludeSessionId: sessionId,
          limit: 3,
          templateType: sessionRow.templateType,
          workspaceId,
        })
      : Promise.resolve([]),
  ]);

  return {
    checklist: sessionRow.checklist,
    exampleText: sessionRow.exampleText,
    messages: messageRows,
    mode: sessionRow.mode,
    recentDeliverables: recentDeliverables.map((deliverable) => ({
      summary: deliverable.preview,
      title: deliverable.title,
    })),
    sources: sourceRows,
    templateType: sessionRow.templateType,
  };
}

async function deleteSessionForWorkspace(sessionId: string, workspaceId: string): Promise<boolean> {
  const database = getDb();
  const deletedRows = await database
    .delete(sessionsTable)
    .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.workspaceId, workspaceId)))
    .returning({ id: sessionsTable.id });

  return deletedRows.length > 0;
}

export {
  createAssistantMessageForSession,
  createSessionForWorkspace,
  createSourceForSession,
  createUserMessageForSession,
  deleteSessionForWorkspace,
  getSessionDetailForWorkspace,
  getSessionPromptContext,
  listSessionsByWorkspace,
  verifySessionOwnership,
};
