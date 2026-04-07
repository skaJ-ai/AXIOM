import type { ReactNode } from 'react';

import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';

import { IDEATION_POINT_ARTICLES } from './ideation-points-content';
import { IdeationPointsSidebar } from './ideation-points-sidebar';

export default function IdeationPointsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(212,228,247,0.9),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(224,250,246,0.75),_transparent_24%),var(--color-bg)] px-6 py-6 lg:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="surface flex flex-col gap-4 px-6 py-5 shadow-[var(--shadow-1)]">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold tracking-tight text-[var(--color-accent)]">
              {BRAND_NAME} · 아이데이션 포인트
            </span>
            <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
              {BRAND_TAGLINE}을 구성하는 개념을 코드 설명이 아니라 설계 언어로 정리한 위키입니다.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <IdeationPointsSidebar articles={IDEATION_POINT_ARTICLES} />

          <section className="surface min-h-[70vh] px-6 py-7 shadow-[var(--shadow-3)] lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:px-8 lg:py-8">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
