import Link from 'next/link';

import {
  BRAND_ELEVATOR_PITCH,
  BRAND_FOUR_MODE_STORY,
  BRAND_MEMBER_VALUE_PROPOSITION,
  BRAND_NAME,
  BRAND_SHORT_LABEL,
  BRAND_TAGLINE,
  BRAND_VALUE_CARDS,
} from '@/lib/brand';
import type { BrandModeStoryItem } from '@/lib/brand';

interface ComparisonRow {
  copilot: string;
  feature: string;
  generalAi: string;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    copilot: '발산·검증·종합·작성으로 사고 단계를 분리해 작업 의도를 잃지 않습니다.',
    feature: '사고 구조',
    generalAi: '한 대화 안에서 탐색, 반론, 요약, 작성이 뒤섞입니다.',
  },
  {
    copilot: '아이디어, 리뷰, 주장, 캔버스가 중간 산출물로 남아 다음 단계로 이어집니다.',
    feature: '중간 산출물',
    generalAi: '답변은 남아도 어떤 판단이 어떻게 만들어졌는지 다시 꺼내기 어렵습니다.',
  },
  {
    copilot: '엔티티·팩트·인사이트와 메모리 청크로 분리되어 조직 기억으로 축적됩니다.',
    feature: '축적 단위',
    generalAi: '대화 로그나 문서 파일 단위로만 남아 재사용 경로가 약합니다.',
  },
  {
    copilot: '이전 세션의 핵심 결과만 압축해 다음 세션의 프롬프트 맥락으로 연결합니다.',
    feature: '이어쓰기',
    generalAi: '이전 작업을 붙여 넣지 않으면 빈 화면에서 다시 시작합니다.',
  },
  {
    copilot: '근거자료, 확신도, 근거 여부 태그, 위키 문서까지 같은 작업공간에서 연결됩니다.',
    feature: '검증 가능성',
    generalAi: '좋은 답변이 나와도 근거와 설계 의도를 별도 관리해야 합니다.',
  },
];

function getModeCardClassName(mode: BrandModeStoryItem['mode']): string {
  if (mode === 'diverge') {
    return 'border-[var(--color-teal)]/20 bg-[var(--color-teal-light)]/60';
  }

  if (mode === 'validate') {
    return 'border-[var(--color-warning)]/20 bg-[var(--color-warning-light)]/60';
  }

  if (mode === 'synthesize') {
    return 'border-[var(--color-info)]/20 bg-[var(--color-info-light)]/60';
  }

  return 'border-[var(--color-success)]/20 bg-[var(--color-success-light)]/60';
}

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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-sans text-[var(--color-text)] selection:bg-[var(--color-teal-light)]">
      <header className="bg-[var(--color-bg-elevated)]/88 fixed top-0 z-50 w-full border-b border-[var(--color-border-subtle)] py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white shadow-[var(--shadow-1)]">
              <span className="text-sm font-bold">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[var(--color-accent)]">
                {BRAND_NAME}
              </span>
              <span className="text-[10px] font-semibold tracking-[0.18em] text-[var(--color-text-secondary)]">
                {BRAND_SHORT_LABEL}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              className="text-sm font-semibold text-[var(--color-text-secondary)] transition hover:text-[var(--color-accent)]"
              href="#lab-value"
            >
              가치 제안
            </Link>
            <Link
              className="text-sm font-semibold text-[var(--color-text-secondary)] transition hover:text-[var(--color-accent)]"
              href="#modes"
            >
              4모드 이야기
            </Link>
            <Link
              className="text-sm font-semibold text-[var(--color-text-secondary)] transition hover:text-[var(--color-accent)]"
              href="#comparison"
            >
              차별점
            </Link>
            <Link
              className="text-sm font-semibold text-[var(--color-text-secondary)] transition hover:text-[var(--color-accent)]"
              href="/ideation-points"
            >
              아이데이션 포인트
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              className="text-sm font-medium text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
              href="/login"
            >
              로그인
            </Link>
            <Link className="btn-teal px-5 py-2.5 text-sm shadow-sm" href="/signup">
              베타 시작
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24">
        <section className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-8 lg:py-28">
          <div className="relative z-10 flex flex-col gap-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-teal-light)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-teal)]">
              <span>●</span>
              HR AX 플랫폼 베타
            </div>

            <div className="flex flex-col gap-5">
              <h1 className="text-balance text-5xl font-extrabold leading-[1.04] tracking-tight text-[var(--color-accent)] md:text-6xl lg:text-7xl">
                생각이 흩어지지 않게,
                <br />
                <span className="text-[var(--color-teal)]">다음 작업의 출발점</span>으로 남깁니다
              </h1>
              <p className="max-w-2xl text-lg font-semibold leading-8 text-[var(--color-text)]">
                {BRAND_TAGLINE}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {BRAND_ELEVATOR_PITCH.map((line, index) => (
                  <article className="workspace-card-muted flex flex-col gap-2 p-4" key={line}>
                    <span className="meta">{`3줄 피치 0${index + 1}`}</span>
                    <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{line}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                className="btn-teal shadow-[var(--color-teal)]/20 flex items-center gap-2 px-7 py-4 text-base shadow-lg"
                href="/workspace"
              >
                작업공간 열기
                <span>→</span>
              </Link>
              <Link className="btn-secondary px-7 py-4 text-base" href="/ideation-points">
                아이데이션 포인트 보기
              </Link>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -inset-8 opacity-60 blur-3xl transition duration-700 group-hover:opacity-80">
              <div className="h-full w-full rounded-[3rem] bg-[radial-gradient(circle_at_top_left,_var(--color-accent-light),_transparent_52%),radial-gradient(circle_at_bottom_right,_var(--color-teal-light),_transparent_46%)]" />
            </div>
            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-8 shadow-[var(--shadow-4)]">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-[var(--color-teal)]" />
                  <span className="meta">4모드 워크벤치</span>
                </div>
                <span className="badge badge-accent">조직 기억 축적</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {BRAND_FOUR_MODE_STORY.map((story) => (
                  <article
                    className={`rounded-[var(--radius-md)] border p-4 ${getModeCardClassName(story.mode)}`}
                    key={story.mode}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className={getModeBadgeClassName(story.mode)}>
                        {story.title.split(' ')[0]}
                      </span>
                      <span className="meta">{getModeMetaLabel(story.mode)}</span>
                    </div>
                    <h2 className="text-base font-semibold leading-6 text-[var(--color-text)]">
                      {story.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {story.description}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-sunken)] p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="section-label">사고 누적 루프</span>
                  <span className="badge badge-neutral">세션 → 지식 → 다음 세션</span>
                </div>
                <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                  아이디어는 검증으로 이어지고, 검증 결과는 종합과 작성의 근거가 됩니다. 최종
                  산출물은 다시 엔티티·팩트·인사이트와 메모리 청크로 남아 이후 작업의 출발점이
                  됩니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8" id="lab-value">
          <div className="mb-12 flex flex-col gap-4">
            <span className="section-label">가치 제안</span>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-accent)] md:text-5xl">
              HR 담당자의 작업공간으로 다시 정의합니다
            </h2>
            <p className="max-w-3xl text-lg leading-8 text-[var(--color-text-secondary)]">
              {BRAND_MEMBER_VALUE_PROPOSITION}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {BRAND_VALUE_CARDS.map((card) => (
              <article className="workspace-card flex flex-col gap-4" key={card.title}>
                <span className="badge badge-accent w-fit">랩 멤버 가치</span>
                <h3 className="text-xl font-bold text-[var(--color-text)]">{card.title}</h3>
                <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8" id="modes">
          <div className="mb-12 flex flex-col gap-4 text-center">
            <span className="section-label">4모드 이야기</span>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-accent)] md:text-5xl">
              HR AX Copilot은 대화를 하나의 채팅이 아니라 네 단계의 사고 흐름으로 다룹니다
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-8 text-[var(--color-text-secondary)]">
              한 번의 답변으로 끝내지 않고, 가능성 탐색부터 문서화까지 각 단계가 남는 구조를 만드는
              것이 이 제품의 핵심입니다.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {BRAND_FOUR_MODE_STORY.map((story) => (
              <article className="workspace-card group flex flex-col gap-4" key={story.mode}>
                <div className="flex items-center justify-between gap-3">
                  <span className={getModeBadgeClassName(story.mode)}>
                    {story.title.split(' ')[0]}
                  </span>
                  <span className="meta">{getModeMetaLabel(story.mode)}</span>
                </div>
                <h3 className="text-xl font-bold leading-7 text-[var(--color-text)]">
                  {story.title}
                </h3>
                <p className="flex-1 text-sm leading-7 text-[var(--color-text-secondary)]">
                  {story.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8" id="comparison">
          <div className="mb-12 flex flex-col gap-4 text-center">
            <span className="section-label">왜 HR AX Copilot인가</span>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-accent)] md:text-5xl">
              일반 채팅형 AI와 다른 점은 답변이 아니라 구조입니다
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-8 text-[var(--color-text-secondary)]">
              HR AX Copilot은 더 그럴듯하게 답하는 도구가 아니라, 사고와 근거를 다음 작업에서
              다시 쓸 수 있게 남기는 구조를 제공합니다.
            </p>
          </div>

          <div className="overflow-x-auto rounded-[1.75rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-2)]">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-sunken)]">
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--color-text)]">
                    비교 항목
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--color-text-secondary)]">
                    일반 채팅형 AI
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--color-accent)]">
                    {BRAND_NAME}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    className="border-b border-[var(--color-border-subtle)] align-top last:border-b-0"
                    key={row.feature}
                  >
                    <td className="px-5 py-5 text-sm font-semibold text-[var(--color-text)]">
                      {row.feature}
                    </td>
                    <td className="px-5 py-5 text-sm leading-7 text-[var(--color-text-secondary)]">
                      {row.generalAi}
                    </td>
                    <td className="px-5 py-5 text-sm leading-7 text-[var(--color-text)]">
                      {row.copilot}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-[var(--color-accent)] p-10 shadow-[var(--shadow-4)] md:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(224,250,246,0.18),_transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(212,228,247,0.22),_transparent_34%)]" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="badge badge-teal mb-4">다음 단계</span>
                <h2 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
                  제품 설명보다 먼저, 개념 구조를 위키로 남깁니다
                </h2>
                <p className="mt-4 text-lg leading-8 text-white/80">
                  아이데이션 포인트 위키에는 디자인 토큰, 저장 구조, 4모드 사고 체계, 자동 축적
                  파이프라인, 세션 체이닝까지 현재 HR AX Copilot의 핵심 개념을 옮겨 적었습니다.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  className="hover:opacity-92 rounded-lg bg-white px-8 py-4 text-base font-bold text-[var(--color-accent)] transition"
                  href="/ideation-points"
                >
                  아이데이션 포인트 열기
                </Link>
                <Link
                  className="rounded-lg border border-white/30 px-8 py-4 text-base font-bold text-white transition hover:bg-white/10"
                  href="/workspace"
                >
                  작업공간으로 이동
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-sunken)] py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 text-center md:flex-row md:items-center md:justify-between md:text-left lg:px-8">
          <div>
            <p className="text-lg font-bold tracking-tight text-[var(--color-accent)]">
              {BRAND_NAME}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">{BRAND_TAGLINE}</p>
          </div>
          <p className="text-sm text-[var(--color-text-tertiary)]">
            발산에서 작성까지, 생각의 흐름을 남기는 HR AX 플랫폼 공통 Copilot
          </p>
        </div>
      </footer>
    </div>
  );
}
