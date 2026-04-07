import type { ReactNode } from 'react';

import Link from 'next/link';

import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';

import { IDEATION_POINT_ARTICLES } from './ideation-points-content';

export default function IdeationPointsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(212,228,247,0.9),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(224,250,246,0.75),_transparent_24%),var(--color-bg)] px-6 py-6 lg:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="surface flex flex-col gap-4 px-6 py-5 shadow-[var(--shadow-1)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold tracking-tight text-[var(--color-accent)]">
              {BRAND_NAME} · 아이데이션 포인트
            </span>
            <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
              {BRAND_TAGLINE}를 구성하는 핵심 개념을 코드가 아닌 설계 언어로 정리한 위키입니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link className="btn-secondary focus-ring" href="/">
              랜딩으로
            </Link>
            <Link className="btn-primary focus-ring" href="/workspace">
              작업공간 열기
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="surface h-fit px-4 py-5 shadow-[var(--shadow-1)] lg:sticky lg:top-6">
            <div className="mb-4 px-2">
              <p className="section-label">탐색 순서</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                먼저 개요를 읽고, 이후 설계 시스템과 파이프라인 항목으로 내려가면 흐름이
                자연스럽습니다.
              </p>
            </div>

            <nav className="flex flex-col gap-1">
              <Link className="sidebar-nav-item" href="/ideation-points">
                개요
              </Link>
              {IDEATION_POINT_ARTICLES.map((article) => (
                <Link
                  className="sidebar-nav-item"
                  href={`/ideation-points/${article.slug}`}
                  key={article.slug}
                >
                  {article.navLabel}
                </Link>
              ))}
            </nav>
          </aside>

          <section className="surface max-h-[calc(100vh-9rem)] min-h-[70vh] overflow-y-auto px-6 py-7 shadow-[var(--shadow-3)] lg:px-8 lg:py-8">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
