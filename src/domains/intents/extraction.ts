import { inferIntentScope } from './scope';

import type { IntentFragmentDraft } from './types';

const EXTRACTION_RULES: {
  confidence: 'high' | 'medium';
  pattern: RegExp;
  type: IntentFragmentDraft['type'];
}[] = [
  { confidence: 'high', pattern: /(단,|예외|제외|미포함|빼고|빼되|제외하고)/i, type: 'exception' },
  {
    confidence: 'high',
    pattern: /(하지 말|넣지 말|노출하지 말|금지|배제|숨겨|빼줘|빼 주세요)/i,
    type: 'prohibition',
  },
  {
    confidence: 'high',
    pattern: /(보고용|보고 대상|대상 독자|독자|임원|경영진|팀장|리더|실무진|회의용)/i,
    type: 'audience',
  },
  {
    confidence: 'medium',
    pattern: /(기준|원칙|우선|이상이면|이하면|중심으로|위주로|기반으로|에 따라)/i,
    type: 'judgment_basis',
  },
  {
    confidence: 'medium',
    pattern: /(선호|좋아하|스타일|톤으로|톤은|형식으로|원해|느낌으로)/i,
    type: 'preference',
  },
  {
    confidence: 'medium',
    pattern: /(이번|현재|상황|배경|이슈|분기|반기|올해|조직개편|평가 시즌|채용 시즌)/i,
    type: 'context',
  },
];

function splitCandidateSentences(text: string): string[] {
  return text
    .split(/[\n\r]+|(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function extractIntentFragmentsFromText(text: string): IntentFragmentDraft[] {
  const sentences = splitCandidateSentences(text);
  const fragments = new Map<string, IntentFragmentDraft>();

  for (const sentence of sentences) {
    for (const rule of EXTRACTION_RULES) {
      if (!rule.pattern.test(sentence)) {
        continue;
      }

      const content = sentence.replace(/\s+/g, ' ').trim();
      const key = `${rule.type}:${content}`;

      if (!fragments.has(key)) {
        fragments.set(key, {
          confidence: rule.confidence,
          content,
          scope: inferIntentScope(sentence),
          speaker: 'user',
          type: rule.type,
        });
      }
    }
  }

  return [...fragments.values()];
}

export { extractIntentFragmentsFromText };
