'use client';

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import Link from 'next/link';

import {
  BRAND_ELEVATOR_PITCH,
  BRAND_FOUR_MODE_STORY,
  BRAND_MEMBER_VALUE_PROPOSITION,
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_VALUE_CARDS,
} from '@/lib/brand';
import type { BrandModeStoryItem, BrandValueCard } from '@/lib/brand';

interface ComparisonRow {
  axiom: string;
  generalAi: string;
  label: string;
}

interface IntroSlide {
  id: 'comparison' | 'cta' | 'modes' | 'overview' | 'trust' | 'value';
  label: string;
  summary: string;
  title: string;
}

interface TrustSignal {
  description: string;
  title: string;
}

const PAGE_COPY = {
  brand: BRAND_NAME,
  homeAction: {
    href: '/',
    label: '랜딩으로',
  },
  keyboardHint: '좌우 방향키로 이동',
  primaryAction: {
    href: '/ideation-points',
    label: '아이데이션 포인트 열기',
  },
  secondaryAction: {
    href: '/workspace/new',
    label: '새 작업 시작',
  },
  subtitle: '랩 내부 베타 브리프',
  title: '제품 개요',
} as const;

const HERO_COPY = {
  headlineFirstLine: '발산에서 작성까지,',
  headlineSecondLine: '생각의 흔적이 다음 작업의 출발점이 됩니다.',
  label: '개요',
  subtitle:
    'AXIOM은 일반 채팅형 AI가 놓치기 쉬운 중간 산출물을 남기고, 랩 안에서 실험한 사고를 조직 기억으로 축적하는 4모드 워크벤치입니다.',
} as const;

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    axiom: '발산·검증·종합·작성의 구조가 있어 작업 목적에 맞는 사고 단계를 유지합니다.',
    generalAi: '하나의 채팅에서 탐색, 반론, 요약, 작성이 모두 섞여 흐릅니다.',
    label: '사고 구조',
  },
  {
    axiom: '아이디어, 리뷰, 주장, 캔버스가 각각 데이터로 남아 다음 세션으로 이어집니다.',
    generalAi: '대화 전문은 남아도 중간 판단을 재사용할 구조가 약합니다.',
    label: '중간 산출물',
  },
  {
    axiom: '엔티티·팩트·인사이트와 메모리 청크로 분리되어 검색과 재활용이 쉬워집니다.',
    generalAi: '대화 로그나 문서 파일 단위로만 남아 다시 쓰려면 사람이 재해석해야 합니다.',
    label: '축적 방식',
  },
  {
    axiom: '이전 세션의 핵심 결과만 압축해 다음 단계 프롬프트에 주입합니다.',
    generalAi: '직접 붙여 넣지 않으면 맥락이 이어지지 않습니다.',
    label: '세션 연결',
  },
  {
    axiom: '확신도, 근거 여부 태그, 위키 문서가 같이 남아 검증 가능한 설계 자산이 됩니다.',
    generalAi: '좋은 답변과 설계 의도를 별도로 정리해야 합니다.',
    label: '검증 가능성',
  },
];

const TRUST_SIGNALS: TrustSignal[] = [
  {
    description:
      'AXIOM은 초안과 사고 재료를 제안할 뿐이며, 최종 판단과 확정은 항상 담당자가 수행합니다.',
    title: '최종 결정은 사람에게 남깁니다',
  },
  {
    description:
      '각 작업은 워크스페이스 안에서 격리되고, 사내망과 내부 저장소를 전제로 설계되어 있습니다.',
    title: '랩 내부 전용 작업공간을 유지합니다',
  },
  {
    description:
      '근거자료, 주장, 확신도, 근거 여부 태그를 함께 남겨 약한 부분을 숨기지 않고 드러냅니다.',
    title: '근거와 확신도를 함께 기록합니다',
  },
  {
    description:
      '아이데이션 포인트 위키에 개념과 설계 의도를 남겨, 구현을 옮겨도 철학이 유지되게 합니다.',
    title: '코드 밖의 설계 의도도 문서화합니다',
  },
];

const INTRO_SLIDES: IntroSlide[] = [
  {
    id: 'overview',
    label: '개요',
    summary: '브랜드 정의와 3줄 엘리베이터 피치를 먼저 보여줍니다.',
    title: 'AXIOM을 어떻게 소개할 것인가',
  },
  {
    id: 'comparison',
    label: '왜 AXIOM인가',
    summary: '일반 채팅형 AI와 달리 중간 산출물과 축적 구조를 전면에 둡니다.',
    title: '답변보다 구조가 다른 제품입니다',
  },
  {
    id: 'modes',
    label: '4모드 이야기',
    summary: '발산에서 작성까지 사고의 각 단계를 분리해 남깁니다.',
    title: '4모드는 단순 기능 목록이 아니라 작업 흐름입니다',
  },
  {
    id: 'value',
    label: '랩 가치',
    summary: '랩 멤버가 이 도구를 써야 하는 이유를 실제 작업 맥락으로 설명합니다.',
    title: '매번 처음부터 설명하지 않기 위해 만듭니다',
  },
  {
    id: 'trust',
    label: '신뢰',
    summary: '사람의 판단, 내부 경계, 근거 추적, 설계 문서화를 함께 묶습니다.',
    title: '신뢰는 제한을 분명히 두는 방식에서 나옵니다',
  },
  {
    id: 'cta',
    label: '다음 단계',
    summary: '워크벤치를 열거나 설계 위키로 들어가는 두 갈래 진입점을 제공합니다.',
    title: '작업과 문서를 함께 열어 둡니다',
  },
];

function getModeBadgeClassName(mode: BrandModeStoryItem['mode']): string {
  if (mode === 'diverge') {
    return 'badge badge-teal';
  }

  if (mode === 'validate') {
    return 'badge badge-warning';
  }

  if (mode === 'synthesize') {
    return 'badge badge-blue';
  }

  return 'badge badge-green';
}

function getModeMetaLabel(mode: BrandModeStoryItem['mode']): string {
  if (mode === 'diverge') {
    return '발산 단계';
  }

  if (mode === 'validate') {
    return '검증 단계';
  }

  if (mode === 'synthesize') {
    return '종합 단계';
  }

  return '작성 단계';
}

function getValueBadgeClassName(index: number): string {
  if (index === 0) {
    return 'badge-accent';
  }

  if (index === 1) {
    return 'badge-teal';
  }

  return 'badge-success';
}

function renderComparisonRow(row: ComparisonRow): ReactElement {
  return (
    <tr className="border-t border-[var(--color-border-subtle)] align-top" key={row.label}>
      <td className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">{row.label}</td>
      <td className="px-5 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
        {row.generalAi}
      </td>
      <td className="px-5 py-4 text-sm leading-6 text-[var(--color-text)]">{row.axiom}</td>
    </tr>
  );
}

function renderModeStoryCard(story: BrandModeStoryItem): ReactElement {
  return (
    <article className="doc-card p-6" key={story.mode}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className={getModeBadgeClassName(story.mode)}>{story.title.split(' ')[0]}</span>
          <span className="meta">{getModeMetaLabel(story.mode)}</span>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-[var(--color-text)]">{story.title}</h3>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            {story.description}
          </p>
        </div>
      </div>
    </article>
  );
}

function renderValueCard(card: BrandValueCard, index: number): ReactElement {
  return (
    <article className="doc-card p-6" key={card.title}>
      <div className="flex flex-col gap-4">
        <span className={`badge ${getValueBadgeClassName(index)} w-fit`}>핵심 가치</span>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-[var(--color-text)]">{card.title}</h3>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{card.description}</p>
        </div>
      </div>
    </article>
  );
}

function renderTrustSignal(signal: TrustSignal): ReactElement {
  return (
    <article className="doc-card p-6" key={signal.title}>
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-semibold text-[var(--color-text)]">{signal.title}</h3>
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{signal.description}</p>
      </div>
    </article>
  );
}

function renderSlideContent(slide: IntroSlide): ReactElement {
  if (slide.id === 'overview') {
    return (
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <span className="section-label">{HERO_COPY.label}</span>
          <div className="flex flex-col gap-4">
            <h1 className="text-balance text-4xl font-bold leading-tight text-[var(--color-text)] lg:text-6xl">
              <span className="block">{HERO_COPY.headlineFirstLine}</span>
              <span className="block">{HERO_COPY.headlineSecondLine}</span>
            </h1>
            <p className="max-w-3xl text-base leading-8 text-[var(--color-text-secondary)] lg:text-lg">
              {HERO_COPY.subtitle}
            </p>
            <p className="text-lg font-semibold text-[var(--color-accent)]">{BRAND_TAGLINE}</p>
          </div>
        </div>
        <div className="grid gap-4">
          {BRAND_ELEVATOR_PITCH.map((line, index) => (
            <article className="doc-card flex h-full flex-col gap-3 p-6" key={line}>
              <p className="meta">{`3줄 피치 0${index + 1}`}</p>
              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">{line}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (slide.id === 'comparison') {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="section-label">{slide.label}</span>
          <h2 className="text-3xl font-semibold text-[var(--color-text)]">{slide.title}</h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
            AXIOM은 좋은 답변을 내는 도구라기보다, 좋은 작업 구조를 남기는 도구로 포지셔닝됩니다.
          </p>
        </div>
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)]">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="bg-[var(--color-bg-sunken)]">
                <th className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">항목</th>
                <th className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">
                  일반 채팅형 AI
                </th>
                <th className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">
                  {BRAND_NAME}
                </th>
              </tr>
            </thead>
            <tbody>{COMPARISON_ROWS.map(renderComparisonRow)}</tbody>
          </table>
        </div>
      </section>
    );
  }

  if (slide.id === 'modes') {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="section-label">{slide.label}</span>
          <h2 className="text-3xl font-semibold text-[var(--color-text)]">{slide.title}</h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
            기능을 늘리는 것이 아니라, 사고 단계를 분리하고 각 단계의 산출물을 남기는 것이
            핵심입니다.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {BRAND_FOUR_MODE_STORY.map(renderModeStoryCard)}
        </div>
      </section>
    );
  }

  if (slide.id === 'value') {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="section-label">{slide.label}</span>
          <h2 className="text-3xl font-semibold text-[var(--color-text)]">{slide.title}</h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
            {BRAND_MEMBER_VALUE_PROPOSITION}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">{BRAND_VALUE_CARDS.map(renderValueCard)}</div>
      </section>
    );
  }

  if (slide.id === 'trust') {
    return (
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="section-label">{slide.label}</span>
          <h2 className="max-w-4xl text-3xl font-semibold text-[var(--color-text)]">
            {slide.title}
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">{TRUST_SIGNALS.map(renderTrustSignal)}</div>
      </section>
    );
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="section-label">{slide.label}</span>
          <h2 className="text-3xl font-semibold text-[var(--color-text)]">{slide.title}</h2>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
            제품을 써 보고 싶다면 워크벤치를 열고, 개념을 옮겨 적고 싶다면 아이데이션 포인트
            위키부터 읽으면 됩니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-teal focus-ring" href={PAGE_COPY.primaryAction.href}>
            {PAGE_COPY.primaryAction.label}
          </Link>
          <Link className="btn-secondary focus-ring" href={PAGE_COPY.secondaryAction.href}>
            {PAGE_COPY.secondaryAction.label}
          </Link>
        </div>
      </div>
      <div className="workspace-card-muted flex max-w-sm flex-col gap-3">
        <p className="meta">내부 베타</p>
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
          설명보다 중요한 것은 실제 작업과 설계 문서가 서로 이어져 있다는 점입니다.
        </p>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = INTRO_SLIDES[currentSlide] ?? INTRO_SLIDES[0]!;
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === INTRO_SLIDES.length - 1;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      if (event.key === 'ArrowRight') {
        setCurrentSlide((previousSlide) => Math.min(previousSlide + 1, INTRO_SLIDES.length - 1));
      }

      if (event.key === 'ArrowLeft') {
        setCurrentSlide((previousSlide) => Math.max(previousSlide - 1, 0));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(212,228,247,0.85),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(224,250,246,0.7),_transparent_28%),var(--color-bg)] px-6 py-6 lg:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="surface flex flex-col gap-4 px-6 py-4 shadow-[var(--shadow-1)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold tracking-tight text-[var(--color-accent)]">
              {PAGE_COPY.brand}
            </span>
            <p className="text-sm text-[var(--color-text-secondary)]">{PAGE_COPY.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link className="btn-secondary focus-ring" href={PAGE_COPY.homeAction.href}>
              {PAGE_COPY.homeAction.label}
            </Link>
            <Link className="btn-primary focus-ring" href={PAGE_COPY.primaryAction.href}>
              {PAGE_COPY.primaryAction.label}
            </Link>
          </div>
        </header>

        <section className="surface overflow-hidden shadow-[var(--shadow-4)]">
          <div className="border-b border-[var(--color-border-subtle)] px-6 py-5 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <span className="section-label">{PAGE_COPY.title}</span>
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-semibold text-[var(--color-text)] lg:text-3xl">
                    {slide.title}
                  </h1>
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                    {slide.summary}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge badge-neutral">{PAGE_COPY.keyboardHint}</span>
                <span className="meta">{`${currentSlide + 1} / ${INTRO_SLIDES.length}`}</span>
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-sunken)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-teal))] transition-[width] duration-300"
                style={{ width: `${((currentSlide + 1) / INTRO_SLIDES.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex min-h-[720px] flex-col justify-between gap-8 px-6 py-8 lg:px-8 lg:py-10">
            <div key={slide.id} className="flex-1">
              {renderSlideContent(slide)}
            </div>

            <div className="flex flex-col gap-5 border-t border-[var(--color-border-subtle)] pt-6">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {INTRO_SLIDES.map((introSlide, slideIndex) => {
                  const isActive = slideIndex === currentSlide;

                  return (
                    <button
                      aria-current={isActive}
                      aria-label={`${introSlide.title} 슬라이드로 이동`}
                      className={`h-2 rounded-full transition-[width,background-color] duration-200 ${
                        isActive
                          ? 'w-8 bg-[var(--color-accent)]'
                          : 'w-2 bg-[var(--color-border-strong)] hover:bg-[var(--color-text-tertiary)]'
                      }`}
                      key={introSlide.id}
                      onClick={() => setCurrentSlide(slideIndex)}
                      type="button"
                    />
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  className="btn-secondary focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isFirstSlide}
                  onClick={() => setCurrentSlide((previousSlide) => Math.max(previousSlide - 1, 0))}
                  type="button"
                >
                  이전
                </button>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="meta">{slide.label}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {slide.summary}
                  </span>
                </div>

                {isLastSlide ? (
                  <Link className="btn-primary focus-ring" href={PAGE_COPY.primaryAction.href}>
                    {PAGE_COPY.primaryAction.label}
                  </Link>
                ) : (
                  <button
                    className="btn-primary focus-ring"
                    onClick={() =>
                      setCurrentSlide((previousSlide) =>
                        Math.min(previousSlide + 1, INTRO_SLIDES.length - 1),
                      )
                    }
                    type="button"
                  >
                    다음
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
