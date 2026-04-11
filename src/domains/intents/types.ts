import type { IntentFragmentConfidence, IntentFragmentType } from '@/lib/db/schema';

interface IntentFragment {
  confidence: IntentFragmentConfidence;
  content: string;
  createdAt: string;
  id: string;
  promoted: boolean;
  scope: string | null;
  speaker: string | null;
  type: IntentFragmentType;
}

interface IntentFragmentDraft {
  confidence?: IntentFragmentConfidence;
  content: string;
  scope?: string | null;
  speaker?: string | null;
  type: IntentFragmentType;
}

export type { IntentFragment, IntentFragmentDraft };
