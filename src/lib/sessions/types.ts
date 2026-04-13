import type { ClusterWithIdeas, Idea } from '@/domains/diverge/types';
import type { IntentFragment } from '@/domains/intents/types';
import type { ClaimWithSources } from '@/domains/synthesize/types';
import type { Review } from '@/domains/validate/types';
import type { WorkCardSummary } from '@/domains/work-cards/types';
import type { Report } from '@/domains/write/types';
import type {
  SessionChecklist,
  SessionMode,
  SessionStatus,
  SourceType,
  TemplateType,
} from '@/lib/db/schema';
import type { DeliverableSummary } from '@/lib/deliverables/types';
import type { ModeBadge, ModeChecklistItem, ModePanelData } from '@/lib/modes';
import type {
  MethodologyCard,
  TemplateBadge,
  TemplateChecklistItem,
  TemplateMethodologyMap,
  TemplateSectionDefinition,
} from '@/lib/templates';

type SessionCanvasSectionStatus = 'complete' | 'empty';

interface SessionMethodologySuggestion extends MethodologyCard {}

interface SessionCanvasSection {
  content: string;
  description: string;
  name: string;
  required: boolean;
  status: SessionCanvasSectionStatus;
}

interface SessionCanvasUpdate {
  methodologySuggestionIds?: string[];
  sections: {
    content: string;
    name: string;
  }[];
  title?: string;
}

interface SessionCanvasState {
  methodologySuggestions: SessionMethodologySuggestion[];
  sections: SessionCanvasSection[];
  title: string;
}

interface SessionMessageMetadata {
  canvas?: SessionCanvasUpdate;
  checklist?: SessionChecklist;
  uiMessageId?: string;
}

interface SessionChatMessage {
  content: string;
  createdAt: string;
  id: string;
  role: 'assistant' | 'system' | 'user';
}

interface SessionSourceSummary {
  content: string;
  createdAt: string;
  id: string;
  label: string | null;
  type: SourceType | null;
}

interface SessionTemplateSummary {
  badge: TemplateBadge;
  checklist: TemplateChecklistItem[];
  description: string;
  estimatedMinutes: number;
  exampleTags: string[];
  methodologyMap: TemplateMethodologyMap;
  name: string;
  sections: TemplateSectionDefinition[];
  type: TemplateType;
}

interface SessionModeSummary {
  badge: ModeBadge;
  checklist: ModeChecklistItem[];
  description: string;
  icon: string;
  mode: SessionMode;
  name: string;
}

interface SessionParentDivergeArtifacts {
  clusters: ClusterWithIdeas[];
  ideas: Idea[];
  mode: 'diverge';
}

interface SessionParentValidateArtifacts {
  mode: 'validate';
  reviews: Review[];
}

interface SessionParentSynthesizeArtifacts {
  claims: ClaimWithSources[];
  mode: 'synthesize';
}

interface SessionParentWriteArtifacts {
  canvas: SessionCanvasState | null;
  mode: 'write';
  report: Report | null;
}

type SessionParentArtifacts =
  | SessionParentDivergeArtifacts
  | SessionParentValidateArtifacts
  | SessionParentSynthesizeArtifacts
  | SessionParentWriteArtifacts;

interface SessionSummary {
  checklist: SessionChecklist;
  createdAt: string;
  id: string;
  messageCount: number;
  mode: SessionMode;
  modeSummary: SessionModeSummary;
  parentSessionId: string | null;
  sourceCount: number;
  status: SessionStatus;
  template: SessionTemplateSummary | null;
  title: string;
  updatedAt: string;
  workCard: WorkCardSummary | null;
}

interface SessionDetail extends SessionSummary {
  canGenerate: boolean;
  canvas: SessionCanvasState;
  exampleText: string | null;
  intents: IntentFragment[];
  latestDeliverable: DeliverableSummary | null;
  messages: SessionChatMessage[];
  panelData: ModePanelData | null;
  readinessPercent: number;
  recentReferences: DeliverableSummary[];
  sources: SessionSourceSummary[];
}

interface CreateSessionRequestBody {
  exampleText?: string;
  mode: SessionMode;
  parentSessionId?: string;
  reportType?: string;
  templateType?: TemplateType;
  workCardId?: string;
  workCardAudience?: string;
  workCardProcessAssetId?: string;
  workCardProcessLabel?: string;
  workCardTitle?: string;
}

interface CreateSourceRequestBody {
  content: string;
  label?: string;
  type?: SourceType;
}

export type {
  CreateSessionRequestBody,
  CreateSourceRequestBody,
  SessionCanvasSection,
  SessionCanvasState,
  SessionCanvasUpdate,
  SessionChatMessage,
  SessionDetail,
  SessionMessageMetadata,
  SessionMethodologySuggestion,
  SessionModeSummary,
  SessionParentArtifacts,
  SessionSourceSummary,
  SessionSummary,
  SessionTemplateSummary,
};
