import Link from 'next/link';

import { BRAND_ELEVATOR_PITCH, BRAND_MEMBER_VALUE_PROPOSITION } from '@/lib/brand';

import {
  IDEATION_POINT_ARTICLES,
  IDEATION_POINT_CATEGORY_META,
  IDEATION_POINT_CATEGORY_ORDER,
  getIdeationPointArticlesByCategory,
} from './ideation-points-content';

const READING_SEQUENCE = [
  {
    description:
      '디자인 토큰, 공통 문서층, 저장 구조처럼 플랫폼을 바꿔도 유지해야 할 바닥을 먼저 읽습니다.',
    slugs: ['design-system', 'markdown-canonical-layer', 'storage-structure'],
    title: '바닥을 먼저 읽기',
  },
  {
    description:
      '의도 질문, 4모드, 방법론 선택을 읽어 AXIOM이 사람의 사고 흐름을 어떻게 재배치하는지 확인합니다.',
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
      '무행동 축적, provenance, hybrid retrieval, memory loop를 읽어 기억과 재사용 구조를 연결합니다.',
    slugs: [
      'zero-action-accumulation',
      'knowledge-accumulation-pipeline',
      'hybrid-retrieval',
      'memory-loop',
    ],
    title: '지식 루프 연결하기',
  },
  {
    description:
      '공유 작업공간, 사람 확정권, 신뢰 등급, 하네스를 읽어 조직 배포 관점의 표면을 마무리합니다.',
    slugs: [
      'private-first-shared-workspace',
      'human-in-the-loop',
      'trust-tier-promotion',
      'harness-engineering-idempotency',
    ],
    title: '조직 표면 마무리',
  },
];

export default function IdeationPointsPage() {
  const categorySummaries = IDEATION_POINT_CATEGORY_ORDER.map((category) => {
    const articles = getIdeationPointArticlesByCategory(category);

    return {
      articles,
      category,
      meta: IDEATION_POINT_CATEGORY_META[category],
    };
  });

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-5 border-b border-[var(--color-border-subtle)] pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge badge-accent">위키 개요</span>
          <span className="badge badge-neutral">{IDEATION_POINT_ARTICLES.length}개 항목</span>
          <span className="badge badge-neutral">
            {IDEATION_POINT_CATEGORY_ORDER.length}개 카테고리
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="max-w-5xl text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
            AXIOM의 /ideation-points는 기능 소개가 아니라, 다른 플랫폼으로 옮겨도 남겨야 할 설계
            판단을 모아 둔 이식용 위키입니다.
          </h1>
          <p className="max-w-4xl text-lg leading-8 text-[var(--color-text-secondary)]">
            코드를 그대로 복제하기보다 왜 이런 경계를 두었는지, 무엇을 먼저 보존해야 하는지를
            이해하도록 설계했습니다. 읽는 순서는 제품의 바닥에서 시작해 사고 체계, AI 파이프라인,
            지식 루프, 조직 배포 표면으로 올라갑니다.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {BRAND_ELEVATOR_PITCH.map((line, index) => (
          <article className="workspace-card-muted flex flex-col gap-3" key={line}>
            <span className="meta">{`핵심 문장 0${index + 1}`}</span>
            <p className="text-sm leading-7 text-[var(--color-text-secondary)]">{line}</p>
          </article>
        ))}
      </section>

      <section className="border-[var(--color-teal)]/20 bg-[var(--color-teal-light)]/60 rounded-[var(--radius-lg)] border p-5">
        <p className="section-label">랩 멤버 가치 제안</p>
        <p className="mt-3 text-sm leading-8 text-[var(--color-text-secondary)]">
          {BRAND_MEMBER_VALUE_PROPOSITION}
        </p>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-[var(--color-text)]">카테고리 지도</h2>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            각 카테고리는 다른 플랫폼으로 옮길 때 보존해야 할 판단 축을 뜻합니다. 항목 수보다 어떤
            질문을 다루는지에 주목해 읽는 편이 좋습니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categorySummaries.map((categorySummary) => (
            <article
              className="workspace-card-muted flex flex-col gap-4"
              key={categorySummary.category}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="badge badge-accent">{categorySummary.meta.label}</span>
                <span className="meta">{categorySummary.articles.length}개</span>
              </div>
              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                {categorySummary.meta.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {categorySummary.articles.slice(0, 3).map((article) => (
                  <Link
                    className="badge badge-neutral transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    href={`/ideation-points/${article.slug}`}
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
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-[var(--color-text)]">읽는 순서 제안</h2>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            처음 읽는 사람을 위한 보수적 경로입니다. 단계별 카드에서 대표 항목으로 바로 이동할 수
            있습니다.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {READING_SEQUENCE.map((stage, index) => (
            <article className="ideation-stage-card" key={stage.title}>
              <div className="ideation-stage-card-top">
                <span className="ideation-stage-badge">{index + 1}</span>
                <h3 className="text-xl font-semibold text-[var(--color-text)]">{stage.title}</h3>
              </div>
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
                      href={`/ideation-points/${article.slug}`}
                      key={article.slug}
                    >
                      {article.navLabel}
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
