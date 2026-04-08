import type { ReactNode } from 'react';

import {
  IDEATION_POINT_ARTICLES,
  IDEATION_POINT_CATEGORY_ORDER,
} from '@/app/ideation-points/ideation-points-content';
import { BRAND_NAME, BRAND_SHORT_LABEL } from '@/lib/brand';

import { WikiSidebar } from './wiki-sidebar';

interface WikiExplorerProps {
  basePath: string;
  children: ReactNode;
}

function WikiExplorer({ basePath, children }: WikiExplorerProps) {
  return (
    <section className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(212,228,247,0.94),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(224,250,246,0.82),_transparent_24%),var(--color-bg)]">
      <div className="flex flex-col gap-4 xl:gap-0">
        <header className="wiki-shell-surface px-4 py-4 md:px-6 md:py-5 xl:rounded-none xl:px-8 xl:py-6 2xl:px-10">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="badge badge-accent">{BRAND_SHORT_LABEL}</span>
              <span className="badge badge-neutral">구현용 설계 위키</span>
              <span className="badge badge-neutral">{IDEATION_POINT_ARTICLES.length}개 항목</span>
              <span className="badge badge-neutral">
                {IDEATION_POINT_CATEGORY_ORDER.length}개 카테고리
              </span>
            </div>
            <div className="space-y-2">
              <p className="section-label">Build Notes</p>
              <h1 className="font-headline text-2xl font-extrabold tracking-tight text-[var(--color-accent)] md:text-3xl xl:text-[2.5rem]">
                {BRAND_NAME} 구현용 위키
              </h1>
              <p className="max-w-5xl text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">
                기술 설계, 구현 메모, 구조 판단을 개발자와 구현 LLM이 참고할 수 있게 정리한
                버전입니다. 팀 공유용 쉬운 설명층은 별도 공유용 위키에서 관리합니다.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-4 px-4 pb-4 md:px-6 md:pb-6 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-0 xl:px-0 xl:pb-0 2xl:grid-cols-[360px_minmax(0,1fr)]">
          <WikiSidebar articles={IDEATION_POINT_ARTICLES} basePath={basePath} />

          <section className="wiki-shell-surface px-5 py-6 md:px-8 md:py-8 xl:min-h-screen xl:rounded-none xl:px-10 xl:py-10 2xl:px-12 2xl:py-12">
            {children}
          </section>
        </div>
      </div>
    </section>
  );
}

export { WikiExplorer };
export type { WikiExplorerProps };
