import type { ReactNode } from 'react';

import { BRAND_NAME, BRAND_SHORT_LABEL, BRAND_TAGLINE } from '@/lib/brand';

import {
  IDEATION_POINT_ARTICLES,
  IDEATION_POINT_CATEGORY_ORDER,
} from './ideation-points-content';
import { IdeationPointsSidebar } from './ideation-points-sidebar';

export default function IdeationPointsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(212,228,247,0.94),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(224,250,246,0.82),_transparent_24%),var(--color-bg)]">
      <div className="flex flex-col gap-4 xl:gap-0">
        <header className="wiki-shell-surface px-4 py-4 md:px-6 md:py-6 xl:rounded-none xl:px-8 xl:py-8 2xl:px-10 2xl:py-9">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-end">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="badge badge-accent">{BRAND_SHORT_LABEL}</span>
                <span className="badge badge-neutral">공유용 설계 위키</span>
              </div>
              <div className="space-y-3">
                <p className="section-label">Transferable Ideation Notes</p>
                <h1 className="font-headline text-3xl font-extrabold tracking-tight text-[var(--color-accent)] md:text-4xl xl:text-[2.9rem]">
                  {BRAND_NAME} 아이데이션 위키
                </h1>
                <p className="max-w-4xl text-base leading-8 text-[var(--color-text-secondary)] md:text-lg">
                  {BRAND_TAGLINE}을 구성하는 판단을 코드 설명이 아니라 공유 가능한 설계 언어로
                  정리했습니다. 지금 보는 문서는 팀원에게 먼저 보여줘도 되는 위키 표면을 기준으로
                  다시 다듬은 버전입니다.
                </p>
              </div>
            </div>

            <div className="wiki-panel-muted grid gap-3 p-5 lg:p-6">
              <div className="rounded-[1.25rem] bg-white/80 px-4 py-4 shadow-[var(--shadow-1)]">
                <p className="section-label">Scope</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                  기능 카탈로그가 아니라, 이후 HR AX 플랫폼으로 옮겨도 남겨야 할 판단 축을 정리한
                  지식 맵입니다.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.25rem] bg-white/74 px-4 py-4 shadow-[var(--shadow-1)]">
                  <p className="meta">ARTICLES</p>
                  <p className="mt-2 font-headline text-3xl font-bold text-[var(--color-text)]">
                    {IDEATION_POINT_ARTICLES.length}
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-white/74 px-4 py-4 shadow-[var(--shadow-1)]">
                  <p className="meta">CATEGORIES</p>
                  <p className="mt-2 font-headline text-3xl font-bold text-[var(--color-text)]">
                    {IDEATION_POINT_CATEGORY_ORDER.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 px-4 pb-4 md:px-6 md:pb-6 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-0 xl:px-0 xl:pb-0 2xl:grid-cols-[360px_minmax(0,1fr)]">
          <IdeationPointsSidebar articles={IDEATION_POINT_ARTICLES} />

          <section className="wiki-shell-surface px-5 py-6 md:px-8 md:py-8 xl:min-h-screen xl:rounded-none xl:px-10 xl:py-10 2xl:px-12 2xl:py-12">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
