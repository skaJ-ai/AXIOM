import type {
  IntentFragmentConfidence,
  IntentFragmentReviewStatus,
  IntentFragmentType,
} from '@/lib/db/schema';

interface IntentFragment {
  confidence: IntentFragmentConfidence;
  content: string;
  createdAt: string;
  id: string;
  promoted: boolean;
  reviewStatus: IntentFragmentReviewStatus;
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

interface IntentReviewItem extends IntentFragment {
  sessionId: string;
  sessionTitle: string;
  workCardId: string | null;
  workCardTitle: string | null;
}

export type { IntentFragment, IntentFragmentDraft, IntentReviewItem };
