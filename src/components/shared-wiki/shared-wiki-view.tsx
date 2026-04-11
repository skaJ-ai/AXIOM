import { notFound } from 'next/navigation';

import { SharedWikiArticleView } from './shared-wiki-article';
import { SHARED_WIKI_ARTICLES, getSharedWikiArticleBySlug } from './shared-wiki-content';
import { SharedWikiOverview } from './shared-wiki-overview';
import { SharedWikiSidebar } from './shared-wiki-sidebar';

interface SharedWikiViewProps {
  basePath: string;
  buildBasePath: string;
  slugSegments?: string[];
}

function SharedWikiView({ basePath, buildBasePath, slugSegments }: SharedWikiViewProps) {
  const [slug, ...rest] = slugSegments ?? [];

  if (!slug) {
    return (
      <section className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(212,228,247,0.94),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(224,250,246,0.82),_transparent_24%),var(--color-bg)]">
        <div className="flex flex-col gap-4 xl:gap-0">
          <header className="wiki-shell-surface px-4 py-4 md:px-6 md:py-5 xl:rounded-none xl:px-8 xl:py-6 2xl:px-10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="badge badge-accent">공유용 위키</span>
                <span className="badge badge-neutral">비개발자 우선</span>
                <span className="badge badge-neutral">{SHARED_WIKI_ARTICLES.length}개 항목</span>
              </div>
              <div className="space-y-2">
                <p className="section-label">Shared Product Guide</p>
                <h1 className="font-headline text-2xl font-extrabold tracking-tight text-[var(--color-accent)] md:text-3xl xl:text-[2.5rem]">
                  HR AX 플랫폼 공유용 위키
                </h1>
                <p className="max-w-5xl text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">
                  비개발자도 따라올 수 있게 제품 개념과 운영 원칙을 쉬운 말로 설명한 버전입니다.
                  구현용 설계 메모는 별도 `build` 위키에서 다룹니다.
                </p>
              </div>
            </div>
          </header>

          <div className="grid gap-4 px-4 pb-4 md:px-6 md:pb-6 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-0 xl:px-0 xl:pb-0 2xl:grid-cols-[360px_minmax(0,1fr)]">
            <SharedWikiSidebar
              articles={SHARED_WIKI_ARTICLES}
              basePath={basePath}
              buildBasePath={buildBasePath}
            />

            <section className="wiki-shell-surface px-5 py-6 md:px-8 md:py-8 xl:min-h-screen xl:rounded-none xl:px-10 xl:py-10 2xl:px-12 2xl:py-12">
              <SharedWikiOverview basePath={basePath} buildBasePath={buildBasePath} />
            </section>
          </div>
        </div>
      </section>
    );
  }

  if (rest.length > 0) {
    notFound();
  }

  const article = getSharedWikiArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <section className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(212,228,247,0.94),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(224,250,246,0.82),_transparent_24%),var(--color-bg)]">
      <div className="flex flex-col gap-4 xl:gap-0">
        <header className="wiki-shell-surface px-4 py-4 md:px-6 md:py-5 xl:rounded-none xl:px-8 xl:py-6 2xl:px-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="badge badge-accent">공유용 위키</span>
              <span className="badge badge-neutral">{article.navLabel}</span>
            </div>
            <div className="space-y-2">
              <p className="section-label">Shared Product Guide</p>
              <h1 className="font-headline text-2xl font-extrabold tracking-tight text-[var(--color-accent)] md:text-3xl xl:text-[2.5rem]">
                HR AX 플랫폼 공유용 위키
              </h1>
              <p className="max-w-5xl text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">
                비개발자도 이해할 수 있는 설명층입니다. 기술 설계와 구현 메모는 구현용 위키에서
                분리해 관리합니다.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-4 px-4 pb-4 md:px-6 md:pb-6 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-0 xl:px-0 xl:pb-0 2xl:grid-cols-[360px_minmax(0,1fr)]">
          <SharedWikiSidebar
            articles={SHARED_WIKI_ARTICLES}
            basePath={basePath}
            buildBasePath={buildBasePath}
          />

          <section className="wiki-shell-surface px-5 py-6 md:px-8 md:py-8 xl:min-h-screen xl:rounded-none xl:px-10 xl:py-10 2xl:px-12 2xl:py-12">
            <SharedWikiArticleView
              article={article}
              basePath={basePath}
              buildBasePath={buildBasePath}
            />
          </section>
        </div>
      </div>
    </section>
  );
}

export { SharedWikiView };
export type { SharedWikiViewProps };
