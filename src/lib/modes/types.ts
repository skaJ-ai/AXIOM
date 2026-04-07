import type { SessionMode, ReportType } from '@/lib/db/schema';

type ModeBadgeColor = 'blue' | 'green' | 'teal' | 'warning';

interface ModeBadge {
  color: ModeBadgeColor;
  label: string;
}

interface ModeChecklistItem {
  helpText: string;
  id: string;
  intent: string;
  label: string;
  weight: number;
}

interface ModePromptSet {
  interview: string;
}

interface ModeDefinition {
  badge: ModeBadge;
  checklist: ModeChecklistItem[];
  description: string;
  icon: string;
  mode: SessionMode;
  name: string;
  starterMessage: string;
  systemPrompt: ModePromptSet;
}

interface DivergePanelData {
  clusters: {
    id: string;
    ideaIds: string[];
    label: string;
    summary: string | null;
  }[];
  ideas: {
    content: string;
    id: string;
    order: number;
    status: string;
  }[];
}

interface ValidatePanelData {
  reviews: {
    category: string;
    content: string;
    id: string;
    personaName: string;
    personaType: string;
    severity: string;
    suggestion: string | null;
  }[];
}

interface SynthesizePanelData {
  claims: {
    confidence: string;
    content: string;
    excerpts: string[];
    id: string;
  }[];
}

interface WritePanelData {
  reportType: ReportType | null;
  sections: {
    confidence: string;
    content: string;
    name: string;
  }[];
}

type ModePanelData = DivergePanelData | SynthesizePanelData | ValidatePanelData | WritePanelData;

export type {
  DivergePanelData,
  ModeBadge,
  ModeBadgeColor,
  ModeChecklistItem,
  ModeDefinition,
  ModePanelData,
  ModePromptSet,
  SynthesizePanelData,
  ValidatePanelData,
  WritePanelData,
};
