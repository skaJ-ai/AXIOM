const DOMAIN_SCOPE_PATTERNS: { pattern: RegExp; scope: string }[] = [
  { pattern: /(인사기획|조직문화|조직개편)/i, scope: '인사기획' },
  { pattern: /(채용|리크루팅|면접)/i, scope: '채용' },
  { pattern: /(평가|성과|리뷰)/i, scope: '평가' },
  { pattern: /(보상|연봉|인센티브)/i, scope: '보상' },
  { pattern: /(교육|러닝|온보딩)/i, scope: '교육' },
  { pattern: /(노무|징계|근태|근로)/i, scope: '노무' },
];

function inferIntentScope(text: string): string | null {
  const match = DOMAIN_SCOPE_PATTERNS.find(({ pattern }) => pattern.test(text));

  return match?.scope ?? null;
}

function inferIntentScopesFromTexts(texts: Array<string | null | undefined>): string[] {
  const scopes = new Set<string>();

  for (const text of texts) {
    if (typeof text !== 'string' || text.trim().length === 0) {
      continue;
    }

    const scope = inferIntentScope(text);

    if (scope) {
      scopes.add(scope);
    }
  }

  return [...scopes];
}

export { inferIntentScope, inferIntentScopesFromTexts };
