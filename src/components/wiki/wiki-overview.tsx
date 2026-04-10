import Link from 'next/link';

import {
  IDEATION_POINT_ARTICLES,
  IDEATION_POINT_CATEGORY_META,
  IDEATION_POINT_CATEGORY_ORDER,
  getIdeationPointArticlesByCategory,
} from '@/app/ideation-points/ideation-points-content';
import {
  BRAND_ELEVATOR_PITCH,
  BRAND_MEMBER_VALUE_PROPOSITION,
} from '@/lib/brand';

import { getWikiArticleHref } from './wiki-paths';

interface WikiOverviewProps {
  basePath: string;
}

const READING_SEQUENCE = [
  {
    description:
      '디자인 토큰, 공통 문서층, 저장 구조처럼 플랫폼을 바꿔도 유지해야 할 바닥을 먼저 읽습니다.',
    slugs: ['design-system', 'markdown-canonical-layer', 'storage-structure'],
    title: '바닥을 먼저 읽기',
  },
  {
    description:
      '의도 질문, 4모드, 방법론 선택을 읽어 Copilot이 사람의 사고 흐름을 어떻게 재배치하는지 확인합니다.',
    slugs: [
      'intent-first-interview',
      'work-redesign-over-training',
      'four-mode-thinking',
      'methodology-library',
    ],
    title: '사고 흐름 이해하기',
  },
  {
    description: '메타데이터 마커, 부모 세션 체인, 계층형 요약과 티어링으로 LLM 제어면을 읽습니다.',
    slugs: [
      'ai-metadata-marker-system',
      'parent-session-chaining',
      'hierarchical-summaries',
      'context-tiering',
    ],
    title: 'AI 파이프라인 읽기',
  },
  {
    description:
      '암묵지 수집, 맥락 태깅, 무행동 축적, provenance, memory loop를 읽어 기억과 재사용 구조를 연결합니다.',
    slugs: [
      'tacit-knowledge-capture',
      'context-graph-for-work-knowledge',
      'zero-action-accumulation',
      'knowledge-accumulation-pipeline',
      'provenance-and-evidence-links',
      'memory-loop',
    ],
    title: '지식 루프 연결하기',
  },
  {
    description:
      '공유 작업공간, 사람 확정권, 지식 충돌 해결, 신뢰 등급, 실행 규칙을 읽어 조직 배포 관점의 표면을 마무리합니다.',
    slugs: [
      'private-first-shared-workspace',
      'human-in-the-loop',
      'knowledge-conflict-resolution',
      'trust-tier-promotion',
      'harness-engineering-idempotency',
    ],
    title: '조직 표면 마무리',
  },
];

function WikiOverview({ basePath }: WikiOverviewProps) {
  const categorySummaries = IDEATION_POINT_CATEGORY_ORDER.map((category) => {
    const articles = getIdeationPointArticlesByCategory(category);

    return {
      articles,
      category,
      meta: IDEATION_POINT_CATEGORY_META[category],
    };
  });

  return (
    <article className="flex flex-col gap-12">
      <section className="flex flex-col gap-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge badge-accent">위키 개요</span>
            <span className="badge badge-neutral">설계 판단 중심</span>
          </div>

          <div className="space-y-4">
            <p className="section-label">Shared Architecture Notes</p>
            <h1 className="font-headline text-balance text-4xl font-extrabold leading-[1.04] tracking-tight text-[var(--color-text)] md:text-5xl xl:text-[3.35rem]">
              기능 소개보다 먼저,
              <br />
              <span className="text-[var(--color-accent)]">옮겨도 남아야 할 설계 판단</span>을
              공유하는 위키
            </h1>
            <p className="max-w-[64rem] text-lg leading-8 text-[var(--color-text-secondary)]">
              이 페이지는 나중에 HR AX 플랫폼으로 통합되더라도 유지해야 하는 사고 체계와 지식
              구조를 먼저 읽히게 하도록 재구성했습니다. 팀 공유 시에는 각 항목의 기능보다 왜 그런
              경계를 두었는지를 읽히는 용도로 쓰는 편이 좋습니다.
            </p>
          </div>
        </div>

        <section className="workspace-card flex flex-col gap-4">
          <p className="section-label">Quick Read</p>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            {BRAND_MEMBER_VALUE_PROPOSITION}
          </p>
          <ul className="grid gap-3">
            {BRAND_ELEVATOR_PITCH.map((line, index) => (
              <li className="flex gap-3 text-sm leading-7 text-[var(--color-text-secondary)]" key={line}>
                <span className="meta pt-1">{`0${index + 1}`}</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="section-label">Category Map</p>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
              카테고리별로 읽으면, 무엇을 보존해야 하는지가 보입니다
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
            각 카테고리는 기능 묶음이 아니라 판단 축입니다. 항목 수보다 어떤 질문을 다루는지를 먼저
            보는 편이 공유용 위키로는 더 효과적입니다.
          </p>
        </div>

        <div className="grid gap-4">
          {categorySummaries.map((categorySummary, index) => (
            <article className="workspace-card" key={categorySummary.category}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="meta">{`CATEGORY 0${index + 1}`}</p>
                    <span className="badge badge-neutral">{categorySummary.articles.length}개</span>
                  </div>
                  <h3 className="font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
                    {categorySummary.meta.label}
                  </h3>
                  <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
                    {categorySummary.meta.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                {categorySummary.articles.map((article) => (
                  <Link
                    className="badge badge-neutral transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    href={getWikiArticleHref(basePath, article.slug)}
                    key={article.slug}
                  >
                    {article.navLabel}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="space-y-2">
          <p className="section-label">Reading Sequence</p>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
            처음 공유할 때는 이 순서가 가장 덜 헷갈립니다
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
            아래 경로는 낯선 사람도 위키의 구조를 빠르게 이해할 수 있게 만든 보수적 순서입니다.
            각 단계는 대표 항목으로 바로 이어집니다.
          </p>
        </div>

        <div className="grid gap-4">
          {READING_SEQUENCE.map((stage, index) => (
            <article className="workspace-card" key={stage.title}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-5">
                <div className="flex items-center gap-3 lg:min-w-[14rem]">
                  <span className="ideation-stage-badge">{index + 1}</span>
                  <div className="space-y-1">
                    <p className="meta">{`STEP 0${index + 1}`}</p>
                    <h3 className="font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
                      {stage.title}
                    </h3>
                  </div>
                </div>
                <div className="flex min-w-0 flex-col gap-3">
                  <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                    {stage.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stage.slugs.map((slug) => {
                      const article = IDEATION_POINT_ARTICLES.find(
                        (candidate) => candidate.slug === slug,
                      );

                      if (!article) {
                        return null;
                      }

                      return (
                        <Link
                          className="badge badge-neutral transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                          href={getWikiArticleHref(basePath, article.slug)}
                          key={article.slug}
                        >
                          {article.navLabel}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}

export { WikiOverview };
export type { WikiOverviewProps };
