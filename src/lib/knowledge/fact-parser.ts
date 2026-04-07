import type { FactCategory } from '@/lib/db/schema';

interface ExtractedFact {
  category: FactCategory;
  content: string;
  numericValue?: string;
  periodLabel?: string;
  unit?: string;
}

const NUMERIC_PATTERN =
  /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(%|점|명|개|건|원|억|만원|시간|일|주|개월|년)?/;
const PERIOD_PATTERN = /(20\d{2}년(?:\s*\d{1,2}월)?|\d{1,2}월|Q[1-4]|상반기|하반기|연간)/;

const CATEGORY_KEYWORDS: { category: FactCategory; keywords: string[] }[] = [
  { category: 'satisfaction', keywords: ['만족도', '만족', '평점', '점수'] },
  { category: 'participation', keywords: ['참여', '참석', '응답', '출석'] },
  { category: 'headcount', keywords: ['인원', '명', '직원', '구성원', '리더', '팀원'] },
  { category: 'progress', keywords: ['진행', '완료', '달성', '진도'] },
  { category: 'kpi', keywords: ['KPI', '지표', '성과', '실적', '목표'] },
];

function detectFactCategory(sentence: string): FactCategory {
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.keywords.some((keyword) => sentence.includes(keyword))) {
      return entry.category;
    }
  }

  return 'kpi';
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function extractFactsFromText(text: string): ExtractedFact[] {
  const facts: ExtractedFact[] = [];
  const sentences = splitIntoSentences(text);

  for (const sentence of sentences) {
    const numericMatch = sentence.match(NUMERIC_PATTERN);

    if (!numericMatch) {
      continue;
    }

    const periodMatch = sentence.match(PERIOD_PATTERN);
    const category = detectFactCategory(sentence);

    facts.push({
      category,
      content: sentence,
      numericValue: numericMatch[1],
      ...(numericMatch[2] ? { unit: numericMatch[2] } : {}),
      ...(periodMatch ? { periodLabel: periodMatch[1] } : {}),
    });
  }

  return facts;
}

export { extractFactsFromText };
export type { ExtractedFact };
