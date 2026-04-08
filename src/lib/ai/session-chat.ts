import type { SessionChecklist, SessionMode, TemplateType } from '@/lib/db/schema';
import { getModeByType } from '@/lib/modes';
import type {
  SessionCanvasState,
  SessionCanvasUpdate,
  SessionMethodologySuggestion,
  SessionParentArtifacts,
} from '@/lib/sessions/types';
import { getTemplateByType } from '@/lib/templates';

import type { StreamTextTransform, UIMessage } from 'ai';

interface BuildInterviewContextOptions {
  currentChecklist: SessionChecklist;
  exampleText?: string | null;
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
}

interface ParsedAssistantMetadata {
  canvas: SessionCanvasUpdate | null;
  checklist: SessionChecklist | null;
  visibleText: string;
}

const EXAMPLE_TEXT_PROMPT_MAX_LENGTH = 3000;
const PARENT_ARTIFACT_TEXT_MAX_LENGTH = 400;
const PARENT_ARTIFACTS_HEADING = '## \uC774\uC804 \uC138\uC158 \uACB0\uACFC\uBB3C';
const SESSION_MODE_LABELS: Record<SessionMode, string> = {
  diverge: '\uBC1C\uC0B0',
  synthesize: '\uC885\uD569',
  validate: '\uAC80\uC99D',
  write: '\uC791\uC131',
};

function truncatePromptReference(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function formatParentArtifactText(text: string): string {
  return truncatePromptReference(text.trim().replace(/\s+/g, ' '), PARENT_ARTIFACT_TEXT_MAX_LENGTH);
}

function buildParentArtifactsSection(parentArtifacts?: SessionParentArtifacts | null): string[] {
  if (!parentArtifacts) {
    return [];
  }

  const lines: string[] = [
    PARENT_ARTIFACTS_HEADING,
    `- \uC774\uC804 \uBAA8\uB4DC: ${SESSION_MODE_LABELS[parentArtifacts.mode]}`,
  ];

  if (parentArtifacts.mode === 'diverge') {
    if (parentArtifacts.ideas.length > 0) {
      lines.push('[\uC544\uC774\uB514\uC5B4]');
      lines.push(
        ...parentArtifacts.ideas.map(
          (idea, index) => `- ${index + 1}. ${formatParentArtifactText(idea.content)}`,
        ),
      );
    }

    if (parentArtifacts.clusters.length > 0) {
      lines.push('[\uD074\uB7EC\uC2A4\uD130]');
      lines.push(
        ...parentArtifacts.clusters.map((cluster, index) => {
          const ideaSummary =
            cluster.ideas.length > 0
              ? ` | \uC544\uC774\uB514\uC5B4: ${cluster.ideas
                  .map((idea) => formatParentArtifactText(idea.content))
                  .join(' / ')}`
              : '';
          const summary = cluster.summary
            ? ` | \uC694\uC57D: ${formatParentArtifactText(cluster.summary)}`
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
            review.suggestion
              ? ` | \uC81C\uC548: ${formatParentArtifactText(review.suggestion)}`
              : ''
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
          excerptSummary.length > 0 ? ` | \uBC1C\uCDBC: ${excerptSummary}` : ''
        }`;
      }),
    );
  } else if (parentArtifacts.report) {
    lines.push(`[\uBCF4\uACE0\uC11C] ${parentArtifacts.report.title}`);
    lines.push(
      ...parentArtifacts.report.sections.map(
        (section) => `- ${section.name}: ${formatParentArtifactText(section.content)}`,
      ),
    );
  } else if (parentArtifacts.canvas) {
    lines.push(`[\uCE94\uBC84\uC2A4] ${parentArtifacts.canvas.title}`);
    lines.push(
      ...parentArtifacts.canvas.sections.map(
        (section) => `- ${section.name}: ${formatParentArtifactText(section.content)}`,
      ),
    );
  }

  return lines.length > 2 ? lines : [];
}

function buildInterviewContext({
  currentChecklist,
  exampleText,
  parentArtifacts,
  recentDeliverables,
  sources,
  templateType,
}: BuildInterviewContextOptions): string {
  const template = getTemplateByType(templateType);
  const checklistState = JSON.stringify(currentChecklist);
  const parentArtifactsSection = buildParentArtifactsSection(parentArtifacts);
  const sourceContext =
    sources.length > 0
      ? sources
          .map((source, index) => {
            const normalizedContent = source.content.trim().replace(/\s+/g, ' ').slice(0, 1200);
            const label = source.label ?? `자료 ${index + 1}`;
            const sourceType = source.type ?? 'text';

            return `- [${label} | ${sourceType}] ${normalizedContent}`;
          })
          .join('\n')
      : '- 현재 첨부된 근거자료 없음';
  const deliverableContext =
    recentDeliverables.length > 0
      ? recentDeliverables
          .map(
            (deliverable, index) =>
              `- 참고 ${index + 1}: ${deliverable.title}\n  요약: ${deliverable.summary}`,
          )
          .join('\n')
      : '- 같은 유형의 이전 산출물 없음';
  const exampleContext =
    exampleText && exampleText.trim().length > 0
      ? truncatePromptReference(exampleText.trim(), EXAMPLE_TEXT_PROMPT_MAX_LENGTH)
      : null;

  return [
    template.systemPrompt.interview,
    '',
    ...(parentArtifactsSection.length > 0 ? [...parentArtifactsSection, ''] : []),
    '[현재 체크리스트 상태]',
    checklistState,
    '',
    '[현재 세션 근거자료]',
    sourceContext,
    '',
    '[같은 유형의 이전 산출물 요약]',
    deliverableContext,
    '',
    ...(exampleContext
      ? [
          '[사용자 제공 예시 문서]',
          '아래는 사용자가 참고용으로 제공한 예시 문서입니다. 이 문서의 문체, 분량, 구조를 스타일 레퍼런스로 사용합니다.',
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

interface BuildModeInterviewContextOptions {
  currentChecklist: SessionChecklist;
  exampleText?: string | null;
  mode: SessionMode;
  parentArtifacts?: SessionParentArtifacts | null;
  sources: {
    content: string;
    label: string | null;
    type: string | null;
  }[];
}

function buildModeInterviewContext({
  currentChecklist,
  exampleText,
  mode,
  parentArtifacts,
  sources,
}: BuildModeInterviewContextOptions): string {
  const modeDefinition = getModeByType(mode);
  const checklistState = JSON.stringify(currentChecklist);
  const parentArtifactsSection = buildParentArtifactsSection(parentArtifacts);
  const sourceContext =
    sources.length > 0
      ? sources
          .map((source, index) => {
            const normalizedContent = source.content.trim().replace(/\s+/g, ' ').slice(0, 1200);
            const label = source.label ?? `자료 ${index + 1}`;
            const sourceType = source.type ?? 'text';

            return `- [${label} | ${sourceType}] ${normalizedContent}`;
          })
          .join('\n')
      : '- 현재 첨부된 근거자료 없음';
  const exampleContext =
    exampleText && exampleText.trim().length > 0
      ? truncatePromptReference(exampleText.trim(), EXAMPLE_TEXT_PROMPT_MAX_LENGTH)
      : null;

  return [
    modeDefinition.systemPrompt.interview,
    '',
    ...(parentArtifactsSection.length > 0 ? [...parentArtifactsSection, ''] : []),
    '[현재 체크리스트 상태]',
    checklistState,
    '',
    '[현재 세션 근거자료]',
    sourceContext,
    '',
    ...(exampleContext
      ? [
          '[사용자 제공 예시 문서]',
          '아래는 사용자가 참고용으로 제공한 예시 문서입니다.',
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
