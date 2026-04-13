import type { SessionChecklist, SessionMode, TemplateType } from '@/lib/db/schema';
import { getModeByType } from '@/lib/modes';
import type {
  SessionCanvasState,
  SessionCanvasUpdate,
  SessionDetail,
  SessionMethodologySuggestion,
  SessionParentArtifacts,
} from '@/lib/sessions/types';
import { getTemplateByType } from '@/lib/templates';

import type { StreamTextTransform, UIMessage } from 'ai';

interface BuildInterviewContextOptions {
  currentChecklist: SessionChecklist;
  exampleText?: string | null;
  intents: SessionDetail['intents'];
  parentArtifacts?: SessionParentArtifacts | null;
  recentDeliverables: {
    summary: string;
    title: string;
  }[];
  sources: {
    content: string;
    label: string | null;
    type: string | null;
  }[];
  templateType: TemplateType;
  workCard: SessionDetail['workCard'];
}

interface ParsedAssistantMetadata {
  canvas: SessionCanvasUpdate | null;
  checklist: SessionChecklist | null;
  visibleText: string;
}

interface BuildModeInterviewContextOptions {
  currentChecklist: SessionChecklist;
  exampleText?: string | null;
  intents: SessionDetail['intents'];
  mode: SessionMode;
  parentArtifacts?: SessionParentArtifacts | null;
  sources: {
    content: string;
    label: string | null;
    type: string | null;
  }[];
  workCard: SessionDetail['workCard'];
}

const EXAMPLE_TEXT_PROMPT_MAX_LENGTH = 3000;
const PARENT_ARTIFACT_TEXT_MAX_LENGTH = 400;
const PARENT_ARTIFACTS_HEADING = '## 이전 세션 결과물';
const SESSION_MODE_LABELS: Record<SessionMode, string> = {
  diverge: '발산',
  synthesize: '종합',
  validate: '검증',
  write: '작성',
};

function truncatePromptReference(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function formatParentArtifactText(text: string): string {
  return truncatePromptReference(text.trim().replace(/\s+/g, ' '), PARENT_ARTIFACT_TEXT_MAX_LENGTH);
}

function formatIntentPromptType(type: SessionDetail['intents'][number]['type']): string {
  switch (type) {
    case 'audience':
      return '대상 독자';
    case 'context':
      return '상황';
    case 'exception':
      return '예외';
    case 'judgment_basis':
      return '판단 기준';
    case 'preference':
      return '선호';
    case 'prohibition':
      return '금지';
    default:
      return type;
  }
}

function formatIntentPromptLine(intent: SessionDetail['intents'][number], index: number): string {
  const scopeLabel = intent.scope ? ` | 범위: ${intent.scope}` : '';

  return `- ${index + 1}. [${formatIntentPromptType(intent.type)}] ${intent.content}${scopeLabel}`;
}

function buildParentArtifactsSection(parentArtifacts?: SessionParentArtifacts | null): string[] {
  if (!parentArtifacts) {
    return [];
  }

  const lines: string[] = [
    PARENT_ARTIFACTS_HEADING,
    `- 이전 모드: ${SESSION_MODE_LABELS[parentArtifacts.mode]}`,
  ];

  if (parentArtifacts.mode === 'diverge') {
    if (parentArtifacts.ideas.length > 0) {
      lines.push('[아이디어]');
      lines.push(
        ...parentArtifacts.ideas.map(
          (idea, index) => `- ${index + 1}. ${formatParentArtifactText(idea.content)}`,
        ),
      );
    }

    if (parentArtifacts.clusters.length > 0) {
      lines.push('[클러스터]');
      lines.push(
        ...parentArtifacts.clusters.map((cluster, index) => {
          const ideaSummary =
            cluster.ideas.length > 0
              ? ` | 아이디어: ${cluster.ideas
                  .map((idea) => formatParentArtifactText(idea.content))
                  .join(' / ')}`
              : '';
          const summary = cluster.summary
            ? ` | 요약: ${formatParentArtifactText(cluster.summary)}`
            : '';

          return `- ${index + 1}. ${cluster.label}${summary}${ideaSummary}`;
        }),
      );
    }
  } else if (parentArtifacts.mode === 'validate') {
    lines.push(
      ...parentArtifacts.reviews.map(
        (review, index) =>
          `- ${index + 1}. [${review.category}/${review.severity}] ${review.personaName}: ${formatParentArtifactText(review.content)}${
            review.suggestion ? ` | 제안: ${formatParentArtifactText(review.suggestion)}` : ''
          }`,
      ),
    );
  } else if (parentArtifacts.mode === 'synthesize') {
    lines.push(
      ...parentArtifacts.claims.map((claim, index) => {
        const excerptSummary = claim.sources
          .map((source) => source.excerpt)
          .filter(
            (excerpt): excerpt is string =>
              typeof excerpt === 'string' && excerpt.trim().length > 0,
          )
          .map((excerpt) => formatParentArtifactText(excerpt))
          .join(' / ');

        return `- ${index + 1}. [${claim.confidence}] ${formatParentArtifactText(claim.content)}${
          excerptSummary.length > 0 ? ` | 발췌: ${excerptSummary}` : ''
        }`;
      }),
    );
  } else if (parentArtifacts.report) {
    lines.push(`[보고서] ${parentArtifacts.report.title}`);
    lines.push(
      ...parentArtifacts.report.sections.map(
        (section) => `- ${section.name}: ${formatParentArtifactText(section.content)}`,
      ),
    );
  } else if (parentArtifacts.canvas) {
    lines.push(`[캔버스] ${parentArtifacts.canvas.title}`);
    lines.push(
      ...parentArtifacts.canvas.sections.map(
        (section) => `- ${section.name}: ${formatParentArtifactText(section.content)}`,
      ),
    );
  }

  return lines.length > 2 ? lines : [];
}

function buildWorkCardSection(workCard: SessionDetail['workCard']): string[] {
  if (!workCard) {
    return [];
  }

  return [
    '## 현재 업무 카드',
    `- 제목: ${workCard.title}`,
    ...(workCard.audience ? [`- 대상 독자: ${workCard.audience}`] : []),
    ...(workCard.processAsset
      ? [
          `- 연결 프로세스 자산: ${workCard.processAsset.name}`,
          ...(workCard.processAsset.domainLabel
            ? [`- 프로세스 도메인: ${workCard.processAsset.domainLabel}`]
            : []),
          ...(workCard.processAsset.description
            ? [`- 프로세스 설명: ${workCard.processAsset.description}`]
            : []),
        ]
      : []),
    ...(workCard.processLabel ? [`- 연결 프로세스: ${workCard.processLabel}`] : []),
    `- 우선순위: ${workCard.priority}`,
    `- 민감도: ${workCard.sensitivity}`,
  ];
}

function buildIntentSections(intents: SessionDetail['intents']): string[] {
  const approvedIntents = intents.filter((intent) => intent.reviewStatus === 'approved');
  const nominatedIntents = intents.filter((intent) => intent.reviewStatus === 'nominated');

  if (approvedIntents.length === 0 && nominatedIntents.length === 0) {
    return [];
  }

  const lines: string[] = [];

  if (approvedIntents.length > 0) {
    lines.push('## 승인된 작업 맥락');
    lines.push(...approvedIntents.slice(0, 8).map(formatIntentPromptLine));
  }

  if (nominatedIntents.length > 0) {
    if (lines.length > 0) {
      lines.push('');
    }

    lines.push('## 현재 세션의 검토 후보 맥락');
    lines.push(
      '- 아래 항목은 아직 승인되지 않았습니다. 현재 세션의 참고 메모로만 사용하고, 다른 카드나 표준 규칙처럼 일반화하지 마세요.',
    );
    lines.push(...nominatedIntents.slice(0, 5).map(formatIntentPromptLine));
  }

  return lines;
}

function buildSourceContext(
  sources: BuildInterviewContextOptions['sources'] | BuildModeInterviewContextOptions['sources'],
): string {
  if (sources.length === 0) {
    return '- 현재 첨부된 근거 자료 없음';
  }

  return sources
    .map((source, index) => {
      const normalizedContent = source.content.trim().replace(/\s+/g, ' ').slice(0, 1200);
      const label = source.label ?? `자료 ${index + 1}`;
      const sourceType = source.type ?? 'text';

      return `- [${label} | ${sourceType}] ${normalizedContent}`;
    })
    .join('\n');
}

function buildDeliverableContext(
  recentDeliverables: BuildInterviewContextOptions['recentDeliverables'],
): string {
  if (recentDeliverables.length === 0) {
    return '- 같은 유형의 이전 제출물 없음';
  }

  return recentDeliverables
    .map(
      (deliverable, index) =>
        `- 참고 ${index + 1}: ${deliverable.title}\n  요약: ${deliverable.summary}`,
    )
    .join('\n');
}

function buildExampleContext(exampleText?: string | null): string | null {
  return exampleText && exampleText.trim().length > 0
    ? truncatePromptReference(exampleText.trim(), EXAMPLE_TEXT_PROMPT_MAX_LENGTH)
    : null;
}

function buildInterviewContext({
  currentChecklist,
  exampleText,
  intents,
  parentArtifacts,
  recentDeliverables,
  sources,
  templateType,
  workCard,
}: BuildInterviewContextOptions): string {
  const template = getTemplateByType(templateType);
  const checklistState = JSON.stringify(currentChecklist);
  const parentArtifactsSection = buildParentArtifactsSection(parentArtifacts);
  const workCardSection = buildWorkCardSection(workCard);
  const intentSections = buildIntentSections(intents);
  const sourceContext = buildSourceContext(sources);
  const deliverableContext = buildDeliverableContext(recentDeliverables);
  const exampleContext = buildExampleContext(exampleText);

  return [
    template.systemPrompt.interview,
    '',
    ...(workCardSection.length > 0 ? [...workCardSection, ''] : []),
    ...(intentSections.length > 0 ? [...intentSections, ''] : []),
    ...(parentArtifactsSection.length > 0 ? [...parentArtifactsSection, ''] : []),
    '[현재 체크리스트 상태]',
    checklistState,
    '',
    '[현재 세션 근거 자료]',
    sourceContext,
    '',
    '[같은 유형의 이전 제출물 요약]',
    deliverableContext,
    '',
    ...(exampleContext
      ? [
          '[사용자 제공 예시 문서]',
          '아래 문서는 사용자가 참고용으로 제공한 예시 문서입니다. 문체, 분량, 구조를 참고 인터페이스로만 사용합니다.',
          exampleContext,
        ]
      : []),
  ].join('\n');
}

function createMetadataCommentTransform(): {
  factory: StreamTextTransform<Record<string, never>>;
  getRawText: () => string;
} {
  let rawAccumulator = '';
  const factory: StreamTextTransform<Record<string, never>> = () => {
    let buffer = '';
    let currentTextId = '';
    let isInsideComment = false;

    return new TransformStream({
      flush(controller) {
        if (!isInsideComment && buffer.length > 0 && currentTextId.length > 0) {
          controller.enqueue({
            id: currentTextId,
            text: buffer,
            type: 'text-delta',
          });
        }
      },
      transform(chunk, controller) {
        if (chunk.type !== 'text-delta') {
          controller.enqueue(chunk);
          return;
        }

        currentTextId = chunk.id;
        rawAccumulator += chunk.text;
        buffer += chunk.text;
        let visibleText = '';

        while (buffer.length > 0) {
          if (isInsideComment) {
            const commentEndIndex = buffer.indexOf('-->');

            if (commentEndIndex < 0) {
              break;
            }

            buffer = buffer.slice(commentEndIndex + 3);
            isInsideComment = false;
            continue;
          }

          const commentStartIndex = buffer.indexOf('<!--');

          if (commentStartIndex < 0) {
            const safeBoundary = Math.max(0, buffer.length - 3);

            if (safeBoundary === 0) {
              break;
            }

            visibleText += buffer.slice(0, safeBoundary);
            buffer = buffer.slice(safeBoundary);
            break;
          }

          if (commentStartIndex > 0) {
            visibleText += buffer.slice(0, commentStartIndex);
          }

          buffer = buffer.slice(commentStartIndex + 4);
          isInsideComment = true;
        }

        if (visibleText.length > 0) {
          controller.enqueue({
            ...chunk,
            text: visibleText,
          });
        }
      },
    });
  };

  return {
    factory,
    getRawText() {
      return rawAccumulator;
    },
  };
}

function extractTextFromUiMessage(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is Extract<(typeof message.parts)[number], { type: 'text' }> =>
        part.type === 'text',
    )
    .map((part) => part.text)
    .join('')
    .trim();
}

function parseAssistantMetadata(rawAssistantText: string): ParsedAssistantMetadata {
  const checklistMatch = rawAssistantText.match(/<!--\s*checklist:(.*?)-->/s);
  const canvasMatch = rawAssistantText.match(/<!--\s*canvas:(.*?)-->/s);
  const visibleText = rawAssistantText
    .replace(/<!--\s*checklist:(.*?)-->/gs, '')
    .replace(/<!--\s*canvas:(.*?)-->/gs, '')
    .replace(/<!--\s*mode-meta:[a-z]+:[\s\S]*?-->/g, '')
    .trim();

  return {
    canvas: parseCanvasMetadata(canvasMatch?.[1]),
    checklist: parseChecklistMetadata(checklistMatch?.[1]),
    visibleText,
  };
}

function parseCanvasMetadata(rawCanvas: string | undefined): SessionCanvasUpdate | null {
  if (!rawCanvas) {
    return null;
  }

  try {
    const parsedCanvas = JSON.parse(rawCanvas) as SessionCanvasUpdate;

    if (!Array.isArray(parsedCanvas.sections)) {
      return null;
    }

    return {
      methodologySuggestionIds: Array.isArray(parsedCanvas.methodologySuggestionIds)
        ? parsedCanvas.methodologySuggestionIds.filter(
            (value): value is string => typeof value === 'string',
          )
        : [],
      sections: parsedCanvas.sections
        .filter(
          (section): section is { content: string; name: string } =>
            typeof section === 'object' &&
            section !== null &&
            typeof section.name === 'string' &&
            typeof section.content === 'string',
        )
        .map((section) => ({
          content: section.content.trim(),
          name: section.name,
        })),
      title: typeof parsedCanvas.title === 'string' ? parsedCanvas.title : undefined,
    };
  } catch {
    return null;
  }
}

function parseChecklistMetadata(rawChecklist: string | undefined): SessionChecklist | null {
  if (!rawChecklist) {
    return null;
  }

  try {
    const parsedChecklist = JSON.parse(rawChecklist) as Record<string, unknown>;

    return Object.fromEntries(
      Object.entries(parsedChecklist).map(([key, value]) => [key, value === true]),
    );
  } catch {
    return null;
  }
}

function mergeCanvasState(
  templateType: TemplateType,
  rawCanvas: SessionCanvasUpdate | null,
): SessionCanvasState {
  const template = getTemplateByType(templateType);
  const sectionsByName = new Map(
    rawCanvas?.sections.map((section) => [section.name, section.content]) ?? [],
  );
  const fallbackSections = rawCanvas?.sections ?? [];

  return {
    methodologySuggestions: getMethodologySuggestions(
      templateType,
      rawCanvas?.methodologySuggestionIds ?? [],
    ),
    sections: template.sections.map((section, index) => {
      const matchedContent =
        sectionsByName.get(section.name) ?? fallbackSections[index]?.content ?? '';
      const trimmedContent = matchedContent.trim();

      return {
        content: trimmedContent,
        description: section.description,
        name: section.name,
        required: section.required,
        status: trimmedContent.length > 0 ? 'complete' : 'empty',
      };
    }),
    title: rawCanvas?.title?.trim() || template.name,
  };
}

function getMethodologySuggestions(
  templateType: TemplateType,
  methodologyIds: string[],
): SessionMethodologySuggestion[] {
  const template = getTemplateByType(templateType);
  const allMethodologies = Object.values(template.methodologyMap).flat();
  const methodologiesById = new Map(
    allMethodologies.map((methodology) => [methodology.id, methodology]),
  );
  const selectedMethodologies = methodologyIds
    .map((methodologyId) => methodologiesById.get(methodologyId))
    .filter((methodology): methodology is SessionMethodologySuggestion => Boolean(methodology));

  if (selectedMethodologies.length > 0) {
    return selectedMethodologies;
  }

  return allMethodologies;
}

function buildModeInterviewContext({
  currentChecklist,
  exampleText,
  intents,
  mode,
  parentArtifacts,
  sources,
  workCard,
}: BuildModeInterviewContextOptions): string {
  const modeDefinition = getModeByType(mode);
  const checklistState = JSON.stringify(currentChecklist);
  const parentArtifactsSection = buildParentArtifactsSection(parentArtifacts);
  const workCardSection = buildWorkCardSection(workCard);
  const intentSections = buildIntentSections(intents);
  const sourceContext = buildSourceContext(sources);
  const exampleContext = buildExampleContext(exampleText);

  return [
    modeDefinition.systemPrompt.interview,
    '',
    ...(workCardSection.length > 0 ? [...workCardSection, ''] : []),
    ...(intentSections.length > 0 ? [...intentSections, ''] : []),
    ...(parentArtifactsSection.length > 0 ? [...parentArtifactsSection, ''] : []),
    '[현재 체크리스트 상태]',
    checklistState,
    '',
    '[현재 세션 근거 자료]',
    sourceContext,
    '',
    ...(exampleContext
      ? [
          '[사용자 제공 예시 문서]',
          '아래 문서는 사용자가 참고용으로 제공한 예시 문서입니다.',
          exampleContext,
        ]
      : []),
  ].join('\n');
}

export {
  buildInterviewContext,
  buildModeInterviewContext,
  createMetadataCommentTransform,
  EXAMPLE_TEXT_PROMPT_MAX_LENGTH,
  extractTextFromUiMessage,
  mergeCanvasState,
  parseAssistantMetadata,
};
