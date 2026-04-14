import { and, asc, desc, eq, sql } from 'drizzle-orm';

import { listClustersBySession, listIdeasBySession } from '@/domains/diverge/queries';
import type { ClusterWithIdeas, Idea } from '@/domains/diverge/types';
import { listIntentFragmentsBySession } from '@/domains/intents/queries';
import { inferIntentScopesFromTexts } from '@/domains/intents/scope';
import type { IntentFragment } from '@/domains/intents/types';
import { listPromotedAssetsByProcessAsset } from '@/domains/promoted-assets/queries';
import type { PromotedAssetSummary } from '@/domains/promoted-assets/types';
import { listClaimsBySession } from '@/domains/synthesize/queries';
import type { ClaimWithSources } from '@/domains/synthesize/types';
import { listReviewsBySession } from '@/domains/validate/queries';
import type { Review } from '@/domains/validate/types';
import { createWorkCard } from '@/domains/work-cards/actions';
import { getWorkCardSummaryByIdForWorkspace } from '@/domains/work-cards/queries';
import {
  getBlockedWorkCardMessage,
  isWorkCardBlockedForNewSession,
} from '@/domains/work-cards/state';
import type { WorkCardSummary } from '@/domains/work-cards/types';
import type { Report } from '@/domains/write/types';
import { mergeCanvasState } from '@/lib/ai/session-chat';
import { getDb } from '@/lib/db';
import type {
  ReportType,
  SessionChecklist,
  SessionMode,
  SourceType,
  TemplateType,
} from '@/lib/db/schema';
import {
  messagesTable,
  processAssetsTable,
  reportsTable,
  sessionsTable,
  sourcesTable,
  workCardsTable,
} from '@/lib/db/schema';
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
  SessionParentArtifacts,
  SessionSummary,
  SessionTemplateSummary,
} from './types';

const REPORT_TYPE_TO_TEMPLATE_TYPE: Record<ReportType, TemplateType> = {
  briefing: 'status',
  operation: 'analysis',
  planning: 'planning',
};

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

function createWorkCardSummary(workCard: WorkCardSummary | null): WorkCardSummary | null {
  return workCard;
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
  workCard,
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
  workCard: WorkCardSummary | null;
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
    workCard: createWorkCardSummary(workCard),
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

function mapWorkCardSummaryRowToSummary(
  row: {
    audience: string | null;
    id: string;
    priority: WorkCardSummary['priority'] | null;
    processAssetCreatedAt?: Date | null;
    processAssetDescription?: string | null;
    processAssetDomainLabel?: string | null;
    processAssetId?: string | null;
    processAssetName?: string | null;
    processAssetUpdatedAt?: Date | null;
    processLabel: string | null;
    sensitivity: WorkCardSummary['sensitivity'] | null;
    status: WorkCardSummary['status'] | null;
    title: string | null;
  } | null,
): WorkCardSummary | null {
  if (!row) {
    return null;
  }

  return {
    audience: row.audience,
    id: row.id,
    priority: row.priority ?? 'medium',
    processAsset: row.processAssetId
      ? {
          createdAt: row.processAssetCreatedAt?.toISOString() ?? new Date(0).toISOString(),
          description: row.processAssetDescription ?? null,
          domainLabel: row.processAssetDomainLabel ?? null,
          id: row.processAssetId,
          name: row.processAssetName ?? '이름 없는 프로세스 자산',
          updatedAt: row.processAssetUpdatedAt?.toISOString() ?? new Date(0).toISOString(),
        }
      : null,
    processLabel: row.processLabel,
    sensitivity: row.sensitivity ?? 'general',
    status: row.status ?? 'active',
    title: row.title ?? '업무 카드',
  };
}

function getWorkCardScopeHints(row: {
  processAssetDomainLabel?: string | null;
  processAssetName?: string | null;
  processLabel: string | null;
}): string[] {
  return inferIntentScopesFromTexts([
    row.processLabel,
    row.processAssetName,
    row.processAssetDomainLabel,
  ]);
}

async function createSessionForWorkspace(
  workspaceId: string,
  mode: SessionMode,
  options?: {
    exampleText?: string;
    ownerUserId?: string;
    parentSessionId?: string;
    reportType?: ReportType;
    templateType?: TemplateType;
    workCardId?: string;
    workCardAudience?: string;
    workCardProcessAssetId?: string;
    workCardProcessLabel?: string;
    workCardTitle?: string;
  },
): Promise<SessionSummary> {
  const database = getDb();
  const modeDefinition = getModeByType(mode);
  const initialChecklist = createInitialModeChecklist(mode);
  const templateType =
    options?.templateType ??
    (mode === 'write' && options?.reportType
      ? REPORT_TYPE_TO_TEMPLATE_TYPE[options.reportType]
      : null);
  const shouldUseExistingWorkCard =
    typeof options?.workCardId === 'string' && options.workCardId.trim().length > 0;
  const shouldCreateWorkCard =
    !shouldUseExistingWorkCard &&
    typeof options?.workCardTitle === 'string' &&
    options.workCardTitle.trim().length > 0;

  return database.transaction(async (transaction) => {
    let workCard: WorkCardSummary | null = null;

    if (shouldUseExistingWorkCard) {
      workCard = await getWorkCardSummaryByIdForWorkspace(
        options!.workCardId!.trim(),
        workspaceId,
        {
          database: transaction,
        },
      );

      if (!workCard) {
        throw new Error('업무 카드를 찾을 수 없습니다.');
      }

      if (isWorkCardBlockedForNewSession(workCard.status)) {
        throw new Error(getBlockedWorkCardMessage(workCard.status));
      }
    } else if (shouldCreateWorkCard) {
      workCard = await createWorkCard({
        audience: options?.workCardAudience,
        database: transaction,
        ownerId: options?.ownerUserId,
        processAssetId: options?.workCardProcessAssetId,
        processLabel: options?.workCardProcessLabel,
        title: options.workCardTitle!.trim(),
        workspaceId,
      });
    }

    const createdSessions = await transaction
      .insert(sessionsTable)
      .values({
        checklist: initialChecklist,
        exampleText: options?.exampleText ?? null,
        mode,
        parentSessionId: options?.parentSessionId ?? null,
        reportType: options?.reportType ?? null,
        templateType,
        title: workCard?.title ?? modeDefinition.name,
        workCardId: workCard?.id ?? null,
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
        workCardId: sessionsTable.workCardId,
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
      workCard,
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
      workCardAudience: workCardsTable.audience,
      workCardId: workCardsTable.id,
      workCardPriority: workCardsTable.priority,
      workCardProcessAssetCreatedAt: processAssetsTable.createdAt,
      workCardProcessAssetDescription: processAssetsTable.description,
      workCardProcessAssetDomainLabel: processAssetsTable.domainLabel,
      workCardProcessAssetId: workCardsTable.processAssetId,
      workCardProcessAssetName: processAssetsTable.name,
      workCardProcessAssetUpdatedAt: processAssetsTable.updatedAt,
      workCardProcessLabel: workCardsTable.processLabel,
      workCardSensitivity: workCardsTable.sensitivity,
      workCardStatus: workCardsTable.status,
      workCardTitle: workCardsTable.title,
    })
    .from(sessionsTable)
    .leftJoin(workCardsTable, eq(sessionsTable.workCardId, workCardsTable.id))
    .leftJoin(processAssetsTable, eq(workCardsTable.processAssetId, processAssetsTable.id))
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
      workCard: mapWorkCardSummaryRowToSummary(
        sessionRow.workCardId
          ? {
              audience: sessionRow.workCardAudience,
              id: sessionRow.workCardId,
              priority: sessionRow.workCardPriority,
              processAssetCreatedAt: sessionRow.workCardProcessAssetCreatedAt,
              processAssetDescription: sessionRow.workCardProcessAssetDescription,
              processAssetDomainLabel: sessionRow.workCardProcessAssetDomainLabel,
              processAssetId: sessionRow.workCardProcessAssetId,
              processAssetName: sessionRow.workCardProcessAssetName,
              processAssetUpdatedAt: sessionRow.workCardProcessAssetUpdatedAt,
              processLabel: sessionRow.workCardProcessLabel,
              sensitivity: sessionRow.workCardSensitivity,
              status: sessionRow.workCardStatus,
              title: sessionRow.workCardTitle,
            }
          : null,
      ),
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
  currentUserId?: string,
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
      workCardAudience: workCardsTable.audience,
      workCardId: workCardsTable.id,
      workCardPriority: workCardsTable.priority,
      workCardProcessAssetCreatedAt: processAssetsTable.createdAt,
      workCardProcessAssetDescription: processAssetsTable.description,
      workCardProcessAssetDomainLabel: processAssetsTable.domainLabel,
      workCardProcessAssetId: workCardsTable.processAssetId,
      workCardProcessAssetName: processAssetsTable.name,
      workCardProcessAssetUpdatedAt: processAssetsTable.updatedAt,
      workCardProcessLabel: workCardsTable.processLabel,
      workCardSensitivity: workCardsTable.sensitivity,
      workCardStatus: workCardsTable.status,
      workCardTitle: workCardsTable.title,
    })
    .from(sessionsTable)
    .leftJoin(workCardsTable, eq(sessionsTable.workCardId, workCardsTable.id))
    .leftJoin(processAssetsTable, eq(workCardsTable.processAssetId, processAssetsTable.id))
    .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.workspaceId, workspaceId)))
    .limit(1);

  const sessionRow = sessionRows[0];

  if (!sessionRow) {
    return null;
  }

  const [messageRows, sourceRows, latestDeliverable, recentReferences, intents] = await Promise.all(
    [
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
      listIntentFragmentsBySession(sessionId, workspaceId),
    ],
  );
  const promotedAssets =
    typeof sessionRow.workCardProcessAssetId === 'string'
      ? await listPromotedAssetsByProcessAsset(sessionRow.workCardProcessAssetId, workspaceId, {
          currentScopeHints: getWorkCardScopeHints({
            processAssetDomainLabel: sessionRow.workCardProcessAssetDomainLabel,
            processAssetName: sessionRow.workCardProcessAssetName,
            processLabel: sessionRow.workCardProcessLabel,
          }),
          currentSensitivity: sessionRow.workCardSensitivity ?? 'general',
          currentUserId,
          excludeWorkCardId: sessionRow.workCardId,
          limit: 6,
        })
      : [];

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
    workCard: mapWorkCardSummaryRowToSummary(
      sessionRow.workCardId
        ? {
            audience: sessionRow.workCardAudience,
            id: sessionRow.workCardId,
            priority: sessionRow.workCardPriority,
            processAssetCreatedAt: sessionRow.workCardProcessAssetCreatedAt,
            processAssetDescription: sessionRow.workCardProcessAssetDescription,
            processAssetDomainLabel: sessionRow.workCardProcessAssetDomainLabel,
            processAssetId: sessionRow.workCardProcessAssetId,
            processAssetName: sessionRow.workCardProcessAssetName,
            processAssetUpdatedAt: sessionRow.workCardProcessAssetUpdatedAt,
            processLabel: sessionRow.workCardProcessLabel,
            sensitivity: sessionRow.workCardSensitivity,
            status: sessionRow.workCardStatus,
            title: sessionRow.workCardTitle,
          }
        : null,
    ),
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
    intents,
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
    promotedAssets,
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
}): Promise<{ messageId: string; workCardId: string | null }> {
  const database = getDb();
  const sessionExists = await database
    .select({ id: sessionsTable.id, workCardId: sessionsTable.workCardId })
    .from(sessionsTable)
    .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.workspaceId, workspaceId)))
    .limit(1);

  if (!sessionExists[0]) {
    throw new Error('세션을 찾을 수 없습니다.');
  }

  return database.transaction(async (transaction) => {
    const createdMessages = await transaction
      .insert(messagesTable)
      .values({
        content,
        metadata: {
          uiMessageId,
        },
        role: 'user',
        sessionId,
      })
      .returning({
        id: messagesTable.id,
      });
    const createdMessage = createdMessages[0];

    await transaction
      .update(sessionsTable)
      .set({
        updatedAt: sql`now()`,
      })
      .where(eq(sessionsTable.id, sessionId));

    if (!createdMessage) {
      throw new Error('사용자 메시지를 저장하지 못했습니다.');
    }

    return {
      messageId: createdMessage.id,
      workCardId: sessionExists[0]?.workCardId ?? null,
    };
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

function mapReportRowToReport(row: {
  createdAt: Date;
  id: string;
  reportType: ReportType;
  sections: Report['sections'];
  sessionId: string | null;
  status: Report['status'];
  title: string;
  updatedAt: Date;
  version: number;
  workspaceId: string;
}): Report {
  return {
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    reportType: row.reportType,
    sections: row.sections,
    sessionId: row.sessionId,
    status: row.status,
    title: row.title,
    updatedAt: row.updatedAt.toISOString(),
    version: row.version,
    workspaceId: row.workspaceId,
  };
}

function hasParentArtifacts(parentArtifacts: SessionParentArtifacts): boolean {
  if (parentArtifacts.mode === 'diverge') {
    return parentArtifacts.ideas.length > 0 || parentArtifacts.clusters.length > 0;
  }

  if (parentArtifacts.mode === 'validate') {
    return parentArtifacts.reviews.length > 0;
  }

  if (parentArtifacts.mode === 'synthesize') {
    return parentArtifacts.claims.length > 0;
  }

  return parentArtifacts.report !== null || parentArtifacts.canvas !== null;
}

async function getWriteParentArtifacts({
  parentSessionId,
  templateType,
  workspaceId,
}: {
  parentSessionId: string;
  templateType: TemplateType | null;
  workspaceId: string;
}): Promise<SessionParentArtifacts | null> {
  const database = getDb();
  const reportRows = await database
    .select({
      createdAt: reportsTable.createdAt,
      id: reportsTable.id,
      reportType: reportsTable.reportType,
      sections: reportsTable.sections,
      sessionId: reportsTable.sessionId,
      status: reportsTable.status,
      title: reportsTable.title,
      updatedAt: reportsTable.updatedAt,
      version: reportsTable.version,
      workspaceId: reportsTable.workspaceId,
    })
    .from(reportsTable)
    .where(
      and(eq(reportsTable.sessionId, parentSessionId), eq(reportsTable.workspaceId, workspaceId)),
    )
    .orderBy(desc(reportsTable.updatedAt))
    .limit(1);
  const latestReport = reportRows[0] ? mapReportRowToReport(reportRows[0]) : null;

  if (latestReport) {
    return {
      canvas: null,
      mode: 'write',
      report: latestReport,
    };
  }

  if (!templateType) {
    return null;
  }

  const parentMessageRows = await database
    .select({
      metadata: messagesTable.metadata,
    })
    .from(messagesTable)
    .where(and(eq(messagesTable.sessionId, parentSessionId), eq(messagesTable.role, 'assistant')))
    .orderBy(desc(messagesTable.createdAt));
  const parentCanvas =
    parentMessageRows
      .map((messageRow) => parseSessionMessageMetadata(messageRow.metadata).canvas ?? null)
      .find((canvas): canvas is NonNullable<SessionMessageMetadata['canvas']> => canvas !== null) ??
    null;

  if (!parentCanvas) {
    return null;
  }

  return {
    canvas: mergeCanvasState(templateType, parentCanvas),
    mode: 'write',
    report: null,
  };
}

async function getParentSessionArtifacts({
  parentSessionId,
  workspaceId,
}: {
  parentSessionId: string;
  workspaceId: string;
}): Promise<SessionParentArtifacts | null> {
  const database = getDb();
  const parentSessionRows = await database
    .select({
      id: sessionsTable.id,
      mode: sessionsTable.mode,
      templateType: sessionsTable.templateType,
    })
    .from(sessionsTable)
    .where(and(eq(sessionsTable.id, parentSessionId), eq(sessionsTable.workspaceId, workspaceId)))
    .limit(1);
  const parentSession = parentSessionRows[0];

  if (!parentSession) {
    return null;
  }

  let parentArtifacts: SessionParentArtifacts | null = null;

  if (parentSession.mode === 'diverge') {
    const [ideas, clusters]: [Idea[], ClusterWithIdeas[]] = await Promise.all([
      listIdeasBySession(parentSession.id),
      listClustersBySession(parentSession.id),
    ]);

    parentArtifacts = {
      clusters,
      ideas,
      mode: 'diverge',
    };
  } else if (parentSession.mode === 'validate') {
    const reviews: Review[] = await listReviewsBySession(parentSession.id);

    parentArtifacts = {
      mode: 'validate',
      reviews,
    };
  } else if (parentSession.mode === 'synthesize') {
    const claims: ClaimWithSources[] = await listClaimsBySession(parentSession.id);

    parentArtifacts = {
      claims,
      mode: 'synthesize',
    };
  } else {
    parentArtifacts = await getWriteParentArtifacts({
      parentSessionId: parentSession.id,
      templateType: parentSession.templateType,
      workspaceId,
    });
  }

  if (!parentArtifacts || !hasParentArtifacts(parentArtifacts)) {
    return null;
  }

  return parentArtifacts;
}

async function getSessionPromptContext({
  currentUserId,
  sessionId,
  workspaceId,
}: {
  currentUserId?: string;
  sessionId: string;
  workspaceId: string;
}): Promise<{
  checklist: SessionChecklist;
  exampleText: string | null;
  intents: IntentFragment[];
  messages: { content: string; role: 'assistant' | 'system' | 'user' }[];
  mode: SessionMode;
  parentArtifacts: SessionParentArtifacts | null;
  promotedAssets: PromotedAssetSummary[];
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
  workCard: WorkCardSummary | null;
}> {
  const database = getDb();
  const sessionRows = await database
    .select({
      checklist: sessionsTable.checklist,
      exampleText: sessionsTable.exampleText,
      id: sessionsTable.id,
      mode: sessionsTable.mode,
      parentSessionId: sessionsTable.parentSessionId,
      templateType: sessionsTable.templateType,
      workCardAudience: workCardsTable.audience,
      workCardId: workCardsTable.id,
      workCardPriority: workCardsTable.priority,
      workCardProcessAssetCreatedAt: processAssetsTable.createdAt,
      workCardProcessAssetDescription: processAssetsTable.description,
      workCardProcessAssetDomainLabel: processAssetsTable.domainLabel,
      workCardProcessAssetId: workCardsTable.processAssetId,
      workCardProcessAssetName: processAssetsTable.name,
      workCardProcessAssetUpdatedAt: processAssetsTable.updatedAt,
      workCardProcessLabel: workCardsTable.processLabel,
      workCardSensitivity: workCardsTable.sensitivity,
      workCardStatus: workCardsTable.status,
      workCardTitle: workCardsTable.title,
    })
    .from(sessionsTable)
    .leftJoin(workCardsTable, eq(sessionsTable.workCardId, workCardsTable.id))
    .leftJoin(processAssetsTable, eq(workCardsTable.processAssetId, processAssetsTable.id))
    .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.workspaceId, workspaceId)))
    .limit(1);

  const sessionRow = sessionRows[0];

  if (!sessionRow) {
    throw new Error('세션을 찾을 수 없습니다.');
  }

  const [messageRows, sourceRows, parentArtifacts, recentDeliverables, intents] = await Promise.all(
    [
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
      sessionRow.parentSessionId
        ? getParentSessionArtifacts({
            parentSessionId: sessionRow.parentSessionId,
            workspaceId,
          })
        : Promise.resolve(null),
      sessionRow.templateType
        ? listRecentReferenceDeliverablesByTemplate({
            excludeSessionId: sessionId,
            limit: 3,
            templateType: sessionRow.templateType,
            workspaceId,
          })
        : Promise.resolve([]),
      listIntentFragmentsBySession(sessionId, workspaceId),
    ],
  );
  const promotedAssets =
    typeof sessionRow.workCardProcessAssetId === 'string'
      ? await listPromotedAssetsByProcessAsset(sessionRow.workCardProcessAssetId, workspaceId, {
          currentScopeHints: getWorkCardScopeHints({
            processAssetDomainLabel: sessionRow.workCardProcessAssetDomainLabel,
            processAssetName: sessionRow.workCardProcessAssetName,
            processLabel: sessionRow.workCardProcessLabel,
          }),
          currentSensitivity: sessionRow.workCardSensitivity ?? 'general',
          currentUserId,
          excludeWorkCardId: sessionRow.workCardId,
          limit: 8,
        })
      : [];

  return {
    checklist: sessionRow.checklist,
    exampleText: sessionRow.exampleText,
    intents,
    messages: messageRows,
    mode: sessionRow.mode,
    parentArtifacts,
    promotedAssets,
    recentDeliverables: recentDeliverables.map((deliverable) => ({
      summary: deliverable.preview,
      title: deliverable.title,
    })),
    sources: sourceRows,
    templateType: sessionRow.templateType,
    workCard: mapWorkCardSummaryRowToSummary(
      sessionRow.workCardId
        ? {
            audience: sessionRow.workCardAudience,
            id: sessionRow.workCardId,
            priority: sessionRow.workCardPriority,
            processAssetCreatedAt: sessionRow.workCardProcessAssetCreatedAt,
            processAssetDescription: sessionRow.workCardProcessAssetDescription,
            processAssetDomainLabel: sessionRow.workCardProcessAssetDomainLabel,
            processAssetId: sessionRow.workCardProcessAssetId,
            processAssetName: sessionRow.workCardProcessAssetName,
            processAssetUpdatedAt: sessionRow.workCardProcessAssetUpdatedAt,
            processLabel: sessionRow.workCardProcessLabel,
            sensitivity: sessionRow.workCardSensitivity,
            status: sessionRow.workCardStatus,
            title: sessionRow.workCardTitle,
          }
        : null,
    ),
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
