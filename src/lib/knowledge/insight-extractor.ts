import type { ClaimConfidence, InsightCategory } from '@/lib/db/schema';

interface ExtractedInsight {
  category: InsightCategory;
  confidence: ClaimConfidence;
  content: string;
}

const INSIGHT_PATTERNS: { category: InsightCategory; keywords: string[] }[] = [
  { category: 'decision', keywords: ['결정', '결론', '확정', '승인'] },
  { category: 'recommendation', keywords: ['권고', '제안', '추천', '필요하다'] },
  { category: 'risk', keywords: ['리스크', '위험', '우려', '주의'] },
  { category: 'lesson', keywords: ['교훈', '배운', '시사점', '학습'] },
  { category: 'trend', keywords: ['추세', '트렌드', '경향', '증가', '감소', '확대', '축소'] },
];

function detectInsightCategory(sentence: string): InsightCategory | null {
  for (const entry of INSIGHT_PATTERNS) {
    if (entry.keywords.some((keyword) => sentence.includes(keyword))) {
      return entry.category;
    }
  }

  return null;
}

function detectConfidence(sentence: string): ClaimConfidence {
  if (/\d/.test(sentence)) {
    return 'high';
  }

  if (sentence.includes('가능') || sentence.includes('예상')) {
    return 'low';
  }

  return 'medium';
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function extractInsightsFromText(text: string): ExtractedInsight[] {
  const insights: ExtractedInsight[] = [];
  const sentences = splitIntoSentences(text);

  for (const sentence of sentences) {
    const category = detectInsightCategory(sentence);

    if (!category) {
      continue;
    }

    insights.push({
      category,
      confidence: detectConfidence(sentence),
      content: sentence,
    });
  }

  return insights;
}

export { extractInsightsFromText };
export type { ExtractedInsight };
