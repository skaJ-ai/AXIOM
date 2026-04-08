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

function getPitchCardClassName(index: number): string {
  if (index === 0) {
    return 'md:col-span-2 xl:col-span-2';
  }

  return '';
}

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
    <article className="flex flex-col gap-12">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.14fr)_360px] xl:items-start">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge badge-accent">위키 개요</span>
            <span className="badge badge-neutral">{IDEATION_POINT_ARTICLES.length}개 항목</span>
            <span className="badge badge-neutral">
              {IDEATION_POINT_CATEGORY_ORDER.length}개 카테고리
            </span>
          </div>

          <div className="space-y-4">
            <p className="section-label">Shared Architecture Notes</p>
            <h1 className="font-headline text-balance text-4xl font-extrabold leading-[1.04] tracking-tight text-[var(--color-text)] md:text-5xl xl:text-[3.55rem]">
              기능 소개보다 먼저,
              <br />
              <span className="text-[var(--color-accent)]">옮겨도 남아야 할 설계 판단</span>을
              공유하는 위키
            </h1>
            <p className="max-w-[58rem] text-lg leading-8 text-[var(--color-text-secondary)]">
              이 페이지는 지금 구현된 화면보다, 나중에 HR AX 플랫폼으로 통합되더라도 유지해야 하는
              사고 체계와 지식 구조를 먼저 읽히게 하도록 재구성했습니다. 팀 공유 시에는 각 항목의
              기능보다 왜 그런 경계를 두었는지를 읽히는 용도로 쓰는 편이 좋습니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {BRAND_ELEVATOR_PITCH.map((line, index) => (
              <article
                className={`wiki-panel-muted flex flex-col gap-3 p-5 lg:p-6 ${getPitchCardClassName(index)}`}
                key={line}
              >
                <span className="meta">{`CORE 0${index + 1}`}</span>
                <p className="text-base leading-7 text-[var(--color-text-secondary)]">{line}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="wiki-panel-muted flex flex-col gap-5 p-6 lg:p-7">
          <div>
            <p className="section-label">Team Share</p>
            <h2 className="mt-3 font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
              팀원에게 먼저 보여주기 위한 요약
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
              {BRAND_MEMBER_VALUE_PROPOSITION}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[1.25rem] bg-white/82 px-4 py-4 shadow-[var(--shadow-1)]">
              <p className="meta">READING PATH</p>
              <p className="mt-2 font-headline text-2xl font-bold text-[var(--color-text)]">
                {READING_SEQUENCE.length} steps
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/82 px-4 py-4 shadow-[var(--shadow-1)]">
              <p className="meta">START HERE</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">바닥 → 사고 → 파이프라인</p>
            </div>
            <div className="rounded-[1.25rem] bg-white/82 px-4 py-4 shadow-[var(--shadow-1)]">
              <p className="meta">SHARE MODE</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                기능 설명보다 설계 판단 위주
              </p>
            </div>
          </div>
        </aside>
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

        <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
          {categorySummaries.map((categorySummary, index) => (
            <article
              className="wiki-panel-muted flex h-full flex-col gap-5 p-6 lg:p-7"
              key={categorySummary.category}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="meta">{`CATEGORY 0${index + 1}`}</p>
                  <h3 className="font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
                    {categorySummary.meta.label}
                  </h3>
                </div>
                <span className="badge badge-neutral">{categorySummary.articles.length}개</span>
              </div>

              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                {categorySummary.meta.description}
              </p>

              <div className="grid gap-2">
                {categorySummary.articles.slice(0, 4).map((article) => (
                  <Link
                    className="rounded-[1rem] bg-white/80 px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] shadow-[var(--shadow-1)] transition hover:-translate-y-0.5 hover:text-[var(--color-accent)]"
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.06fr)_minmax(320px,0.94fr)]">
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <p className="section-label">Reading Sequence</p>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
              처음 공유할 때는 이 순서가 가장 덜 헷갈립니다
            </h2>
            <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
              아래 경로는 낯선 사람도 위키의 구조를 빠르게 이해할 수 있게 만든 보수적 순서입니다.
              각 단계 카드는 대표 항목으로 바로 이어집니다.
            </p>
          </div>

          <div className="grid gap-4">
            {READING_SEQUENCE.map((stage, index) => (
              <article className="ideation-stage-card" key={stage.title}>
                <div className="ideation-stage-card-top">
                  <span className="ideation-stage-badge">{index + 1}</span>
                  <div className="space-y-2">
                    <p className="meta">{`STEP 0${index + 1}`}</p>
                    <h3 className="font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
                      {stage.title}
                    </h3>
                  </div>
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
        </div>

        <aside className="wiki-panel-muted flex flex-col gap-5 p-6 lg:p-7">
          <div>
            <p className="section-label">Use This Wiki</p>
            <h2 className="mt-3 font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
              팀 공유 시 읽히는 포인트
            </h2>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.25rem] bg-white/78 px-5 py-5 shadow-[var(--shadow-1)]">
              <p className="meta">01</p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                먼저 카테고리 이름만 훑게 하고, 그다음 각 카테고리의 대표 항목으로 내려가게 하면
                전체 구조를 더 빨리 이해합니다.
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/78 px-5 py-5 shadow-[var(--shadow-1)]">
              <p className="meta">02</p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                기능을 시연하기보다, 왜 이런 경계와 기억 구조를 두었는지부터 설명하면 플랫폼 논의와
                위키 논의가 섞이지 않습니다.
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/78 px-5 py-5 shadow-[var(--shadow-1)]">
              <p className="meta">03</p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                나중에 HR AX 플랫폼으로 합쳐질 때도 그대로 가져갈 수 있는 판단 축인지, 각 항목을 그
                기준으로 읽히게 하는 것이 핵심입니다.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </article>
  );
}
