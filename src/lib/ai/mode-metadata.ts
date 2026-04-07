import { createCluster, createIdea, mergeIdeasIntoCluster } from '@/domains/diverge/actions';
import { listIdeasBySession } from '@/domains/diverge/queries';
import { createClaim, linkClaimSource } from '@/domains/synthesize/actions';
import { createReview } from '@/domains/validate/actions';
import type {
  ClaimConfidence,
  IdeaStatus,
  PersonaType,
  ReviewCategory,
  ReviewSeverity,
  SessionMode,
} from '@/lib/db/schema';

interface ParsedIdea {
  content: string;
  status?: IdeaStatus;
}

interface ParsedCluster {
  ideaContents?: string[];
  label: string;
  summary?: string;
}

interface ParsedReview {
  category: ReviewCategory;
  content: string;
  personaName: string;
  personaType: PersonaType;
  severity: ReviewSeverity;
  suggestion?: string;
}

interface ParsedClaim {
  confidence: ClaimConfidence;
  content: string;
  excerpts?: string[];
}

interface ParsedModeMetadata {
  claims: ParsedClaim[];
  clusters: ParsedCluster[];
  ideas: ParsedIdea[];
  reviews: ParsedReview[];
}

const MODE_META_PATTERN = /<!--\s*mode-meta:([a-z]+):([\s\S]*?)-->/g;

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function asIdeaStatus(value: unknown): IdeaStatus | undefined {
  if (value === 'active' || value === 'merged' || value === 'discarded') {
    return value;
  }

  return undefined;
}

function asReviewCategory(value: unknown): ReviewCategory | undefined {
  if (
    value === 'risk' ||
    value === 'evidence_gap' ||
    value === 'feasibility' ||
    value === 'assumption'
  ) {
    return value;
  }

  return undefined;
}

function asReviewSeverity(value: unknown): ReviewSeverity | undefined {
  if (value === 'high' || value === 'medium' || value === 'low') {
    return value;
  }

  return undefined;
}

function asPersonaType(value: unknown): PersonaType | undefined {
  if (
    value === 'executive' ||
    value === 'field_worker' ||
    value === 'critic' ||
    value === 'union' ||
    value === 'custom'
  ) {
    return value;
  }

  return undefined;
}

function asClaimConfidence(value: unknown): ClaimConfidence | undefined {
  if (value === 'high' || value === 'medium' || value === 'low') {
    return value;
  }

  return undefined;
}

function parseIdeas(rawValue: unknown): ParsedIdea[] {
  if (!Array.isArray(rawValue)) {
    return [];
  }

  return rawValue
    .map((entry): ParsedIdea | null => {
      if (typeof entry === 'string' && entry.trim().length > 0) {
        return { content: entry.trim() };
      }

      if (
        typeof entry === 'object' &&
        entry !== null &&
        'content' in entry &&
        isString((entry as { content: unknown }).content)
      ) {
        const status = asIdeaStatus((entry as { status?: unknown }).status);

        return {
          content: (entry as { content: string }).content.trim(),
          ...(status ? { status } : {}),
        };
      }

      return null;
    })
    .filter((idea): idea is ParsedIdea => idea !== null);
}

function parseClusters(rawValue: unknown): ParsedCluster[] {
  if (!Array.isArray(rawValue)) {
    return [];
  }

  return rawValue
    .map((entry): ParsedCluster | null => {
      if (typeof entry !== 'object' || entry === null) {
        return null;
      }

      const label = (entry as { label?: unknown }).label;

      if (!isString(label)) {
        return null;
      }

      const summary = (entry as { summary?: unknown }).summary;
      const rawIdeas =
        (entry as { ideas?: unknown; ideaContents?: unknown }).ideas ??
        (entry as { ideaContents?: unknown }).ideaContents;
      const ideaContents = Array.isArray(rawIdeas)
        ? rawIdeas.filter(isString).map((value) => value.trim())
        : undefined;

      return {
        ideaContents,
        label: label.trim(),
        ...(isString(summary) ? { summary: summary.trim() } : {}),
      };
    })
    .filter((cluster): cluster is ParsedCluster => cluster !== null);
}

function parseReviews(rawValue: unknown): ParsedReview[] {
  if (!Array.isArray(rawValue)) {
    return [];
  }

  return rawValue
    .map((entry): ParsedReview | null => {
      if (typeof entry !== 'object' || entry === null) {
        return null;
      }

      const content = (entry as { content?: unknown }).content;
      const personaName = (entry as { personaName?: unknown }).personaName;
      const personaType = asPersonaType((entry as { personaType?: unknown }).personaType);
      const category = asReviewCategory((entry as { category?: unknown }).category);
      const severity = asReviewSeverity((entry as { severity?: unknown }).severity);

      if (!isString(content) || !isString(personaName) || !personaType || !category || !severity) {
        return null;
      }

      const suggestion = (entry as { suggestion?: unknown }).suggestion;

      return {
        category,
        content: content.trim(),
        personaName: personaName.trim(),
        personaType,
        severity,
        ...(isString(suggestion) ? { suggestion: suggestion.trim() } : {}),
      };
    })
    .filter((review): review is ParsedReview => review !== null);
}

function parseClaims(rawValue: unknown): ParsedClaim[] {
  if (!Array.isArray(rawValue)) {
    return [];
  }

  return rawValue
    .map((entry): ParsedClaim | null => {
      if (typeof entry !== 'object' || entry === null) {
        return null;
      }

      const content = (entry as { content?: unknown }).content;
      const confidence = asClaimConfidence((entry as { confidence?: unknown }).confidence);
      const excerpts = (entry as { excerpts?: unknown }).excerpts;

      if (!isString(content) || !confidence) {
        return null;
      }

      const parsedExcerpts = Array.isArray(excerpts)
        ? excerpts.filter(isString).map((excerpt) => excerpt.trim())
        : [];

      return {
        confidence,
        content: content.trim(),
        ...(parsedExcerpts.length > 0 ? { excerpts: parsedExcerpts } : {}),
      };
    })
    .filter((claim): claim is ParsedClaim => claim !== null);
}

function parseModeMetadata(rawAssistantText: string): ParsedModeMetadata {
  const accumulator: ParsedModeMetadata = {
    claims: [],
    clusters: [],
    ideas: [],
    reviews: [],
  };

  const matches = rawAssistantText.matchAll(MODE_META_PATTERN);

  for (const match of matches) {
    const kind = match[1];
    const rawJson = match[2]?.trim();

    if (!kind || !rawJson) {
      continue;
    }

    let parsedValue: unknown;

    try {
      parsedValue = JSON.parse(rawJson);
    } catch {
      continue;
    }

    if (kind === 'ideas') {
      accumulator.ideas.push(...parseIdeas(parsedValue));
    } else if (kind === 'clusters') {
      accumulator.clusters.push(...parseClusters(parsedValue));
    } else if (kind === 'reviews') {
      accumulator.reviews.push(...parseReviews(parsedValue));
    } else if (kind === 'claims') {
      accumulator.claims.push(...parseClaims(parsedValue));
    }
  }

  return accumulator;
}

function stripModeMetadataMarkers(rawAssistantText: string): string {
  return rawAssistantText.replace(MODE_META_PATTERN, '').trim();
}

async function persistModeMetadata(
  mode: SessionMode,
  sessionId: string,
  metadata: ParsedModeMetadata,
): Promise<void> {
  if (mode === 'diverge') {
    const existingIdeas = await listIdeasBySession(sessionId);
    const existingContents = new Set(existingIdeas.map((idea) => idea.content));
    let order = existingIdeas.length;

    for (const idea of metadata.ideas) {
      if (existingContents.has(idea.content)) {
        continue;
      }

      await createIdea(sessionId, idea.content, order);
      existingContents.add(idea.content);
      order += 1;
    }

    for (const cluster of metadata.clusters) {
      const clusterId = await createCluster(sessionId, cluster.label, cluster.summary);

      if (cluster.ideaContents && cluster.ideaContents.length > 0) {
        const refreshedIdeas = await listIdeasBySession(sessionId);
        const ideaIdsByContent = new Map(refreshedIdeas.map((idea) => [idea.content, idea.id]));
        const matchedIds = cluster.ideaContents
          .map((content) => ideaIdsByContent.get(content))
          .filter((id): id is string => typeof id === 'string');

        if (matchedIds.length > 0) {
          await mergeIdeasIntoCluster(clusterId, matchedIds);
        }
      }
    }

    return;
  }

  if (mode === 'validate') {
    for (const review of metadata.reviews) {
      await createReview({
        category: review.category,
        content: review.content,
        personaName: review.personaName,
        personaType: review.personaType,
        sessionId,
        severity: review.severity,
        suggestion: review.suggestion,
      });
    }

    return;
  }

  if (mode === 'synthesize') {
    for (const claim of metadata.claims) {
      const claimId = await createClaim(sessionId, claim.content, claim.confidence);

      if (claim.excerpts) {
        for (const excerpt of claim.excerpts) {
          await linkClaimSource(claimId, { excerpt });
        }
      }
    }
  }
}

export { parseModeMetadata, persistModeMetadata, stripModeMetadataMarkers };
export type { ParsedModeMetadata };
