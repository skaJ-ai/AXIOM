import type { EntityType } from '@/lib/db/schema';

interface ExtractedEntity {
  aliases: string[];
  name: string;
  type: EntityType;
}

const DEPARTMENT_KEYWORDS = ['팀', '본부', '실', '부서', '사업부', '센터', '그룹'];
const PROJECT_KEYWORDS = ['프로젝트', '과제', 'TF', '태스크포스'];
const PROGRAM_KEYWORDS = ['프로그램', '교육', '워크숍', '캠페인'];
const POLICY_KEYWORDS = ['정책', '제도', '규정', '지침', '가이드라인'];

function detectEntityType(token: string): EntityType | null {
  if (DEPARTMENT_KEYWORDS.some((keyword) => token.endsWith(keyword))) {
    return 'department';
  }

  if (PROJECT_KEYWORDS.some((keyword) => token.includes(keyword))) {
    return 'project';
  }

  if (PROGRAM_KEYWORDS.some((keyword) => token.includes(keyword))) {
    return 'program';
  }

  if (POLICY_KEYWORDS.some((keyword) => token.includes(keyword))) {
    return 'policy';
  }

  return null;
}

function extractEntitiesFromText(text: string): ExtractedEntity[] {
  const entities = new Map<string, ExtractedEntity>();
  const tokens = text.split(/[\s,.()\[\]{}「」『』·:;!?\n]+/).filter((token) => token.length >= 2);

  for (const rawToken of tokens) {
    const token = rawToken.trim();

    if (token.length < 2 || token.length > 30) {
      continue;
    }

    const type = detectEntityType(token);

    if (!type) {
      continue;
    }

    if (!entities.has(token)) {
      entities.set(token, {
        aliases: [],
        name: token,
        type,
      });
    }
  }

  return Array.from(entities.values());
}

export { extractEntitiesFromText };
export type { ExtractedEntity };
