import { AI_PIPELINE_ARTICLES } from './articles/ai-pipeline';
import { ENGINEERING_HARNESS_ARTICLES } from './articles/engineering-harness';
import { FOUNDATION_ARTICLES } from './articles/foundation';
import { GOVERNANCE_SURFACE_ARTICLES } from './articles/governance-surface';
import { KNOWLEDGE_LAYER_ARTICLES } from './articles/knowledge-layer';
import { THINKING_SYSTEM_ARTICLES } from './articles/thinking-system';

type IdeationPointCategory =
  | 'foundation'
  | 'thinking-system'
  | 'ai-pipeline'
  | 'knowledge-layer'
  | 'governance-surface'
  | 'engineering-harness';

type IdeationPointSourceKind = 'code' | 'reference' | 'draft';

interface IdeationPointBlock {
  bullets?: string[];
  paragraphs: string[];
  title: string;
}

interface IdeationPointSource {
  kind: IdeationPointSourceKind;
  path: string;
}

interface IdeationPointArticle {
  blocks: IdeationPointBlock[];
  category: IdeationPointCategory;
  navLabel: string;
  relatedSlugs: string[];
  slug: string;
  sources: IdeationPointSource[];
  summary: string;
  title: string;
  whyItMatters: string;
}

interface IdeationPointCategoryMeta {
  description: string;
  label: string;
}

const IDEATION_POINT_CATEGORY_ORDER: IdeationPointCategory[] = [
  'foundation',
  'thinking-system',
  'ai-pipeline',
  'knowledge-layer',
  'governance-surface',
  'engineering-harness',
];

const IDEATION_POINT_CATEGORY_META: Record<IdeationPointCategory, IdeationPointCategoryMeta> = {
  'ai-pipeline': {
    description: '대화 출력, 요약, 체이닝, 티어링처럼 LLM 동작을 제어하는 압축 계층입니다.',
    label: 'AI 파이프라인',
  },
  'engineering-harness': {
    description: '멱등성과 계층형 컨텍스트 규칙으로 구현 결과를 통제하는 하네스 레이어입니다.',
    label: '엔지니어링 하네스',
  },
  foundation: {
    description:
      '디자인 토큰, 공통 문서층, 저장 구조처럼 다른 플랫폼으로 옮겨도 유지해야 할 바닥입니다.',
    label: '기반 레이어',
  },
  'governance-surface': {
    description: '공유 작업공간, 액션 경계, 사람 검토, 신뢰 등급처럼 조직 사용을 여는 표면입니다.',
    label: '거버넌스 표면',
  },
  'knowledge-layer': {
    description:
      '자동 축적, provenance, retrieval, memory loop처럼 지식을 되돌려 쓰게 만드는 층입니다.',
    label: '지식 레이어',
  },
  'thinking-system': {
    description:
      '의도 질문, 4모드, 방법론 선택, 업무 재설계처럼 사람의 사고 흐름을 바꾸는 설계입니다.',
    label: '사고 체계',
  },
};

const IDEATION_POINT_ARTICLES: IdeationPointArticle[] = [
  ...FOUNDATION_ARTICLES,
  ...THINKING_SYSTEM_ARTICLES,
  ...AI_PIPELINE_ARTICLES,
  ...KNOWLEDGE_LAYER_ARTICLES,
  ...GOVERNANCE_SURFACE_ARTICLES,
  ...ENGINEERING_HARNESS_ARTICLES,
];

const IDEATION_POINT_ARTICLE_MAP = new Map(
  IDEATION_POINT_ARTICLES.map((article) => [article.slug, article]),
);

function getIdeationPointBySlug(slug: string): IdeationPointArticle | undefined {
  return IDEATION_POINT_ARTICLE_MAP.get(slug);
}

function getIdeationPointArticlesByCategory(
  category: IdeationPointCategory,
): IdeationPointArticle[] {
  return IDEATION_POINT_ARTICLES.filter((article) => article.category === category);
}

export {
  AI_PIPELINE_ARTICLES,
  ENGINEERING_HARNESS_ARTICLES,
  FOUNDATION_ARTICLES,
  GOVERNANCE_SURFACE_ARTICLES,
  IDEATION_POINT_ARTICLES,
  IDEATION_POINT_CATEGORY_META,
  IDEATION_POINT_CATEGORY_ORDER,
  KNOWLEDGE_LAYER_ARTICLES,
  THINKING_SYSTEM_ARTICLES,
  getIdeationPointArticlesByCategory,
  getIdeationPointBySlug,
};
export type {
  IdeationPointArticle,
  IdeationPointBlock,
  IdeationPointCategory,
  IdeationPointCategoryMeta,
  IdeationPointSource,
  IdeationPointSourceKind,
};
