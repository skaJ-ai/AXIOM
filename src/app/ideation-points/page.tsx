import Link from 'next/link';

import { BRAND_ELEVATOR_PITCH, BRAND_MEMBER_VALUE_PROPOSITION } from '@/lib/brand';

import { IDEATION_POINT_ARTICLES } from './ideation-points-content';

export default function IdeationPointsPage() {
  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-5 border-b border-[var(--color-border-subtle)] pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge badge-accent">위키 개요</span>
          <span className="badge badge-neutral">{IDEATION_POINT_ARTICLES.length}개 항목</span>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
            아이데이션 포인트는 “무엇을 만들었는가”보다 “왜 그렇게 만들었는가”를 남깁니다
          </h1>
          <p className="max-w-4xl text-lg leading-8 text-[var(--color-text-secondary)]">
            미래의 엔지니어가 다른 플랫폼에 AXIOM의 개념을 옮길 때, 코드 구현이 아니라 설계 철학과
            경계 조건을 먼저 이해하도록 돕는 위키입니다.
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
        <p className="section-label">랩 멤버 가치</p>
        <p className="mt-3 text-sm leading-8 text-[var(--color-text-secondary)]">
          {BRAND_MEMBER_VALUE_PROPOSITION}
        </p>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-[var(--color-text)]">읽는 순서 제안</h2>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            디자인과 저장 구조로 시작해 사고 체계, 파이프라인, 메타데이터, 체이닝, 메모리 루프로
            내려가면 제품의 전체 설계가 한 줄로 이어집니다.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {IDEATION_POINT_ARTICLES.map((article) => (
            <Link
              className="workspace-card group flex flex-col gap-4 transition hover:-translate-y-1 hover:border-[var(--color-accent)]"
              href={`/ideation-points/${article.slug}`}
              key={article.slug}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="badge badge-accent">{article.navLabel}</span>
                <span className="meta">{article.sourcePaths.length}개 근거 파일</span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                  {article.title}
                </h3>
                <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                  {article.summary}
                </p>
              </div>
              <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                {article.whyItMatters}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
