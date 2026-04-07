import type { ClaimConfidence } from '@/lib/db/schema';

interface Claim {
  confidence: ClaimConfidence;
  content: string;
  createdAt: string;
  id: string;
  sessionId: string;
}

interface ClaimWithSources extends Claim {
  sources: {
    excerpt: string | null;
    sourceId: string;
  }[];
}

export type { Claim, ClaimWithSources };
