import type { PersonaType, ReviewCategory, ReviewSeverity } from '@/lib/db/schema';

interface Review {
  category: ReviewCategory;
  content: string;
  createdAt: string;
  id: string;
  personaName: string;
  personaType: PersonaType;
  sessionId: string;
  severity: ReviewSeverity;
  suggestion: string | null;
}

interface ReviewWithPersona extends Review {}

export type { Review, ReviewWithPersona };
