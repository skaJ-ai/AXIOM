import Link from 'next/link';

import { getWikiArticleHref } from '@/components/wiki/wiki-paths';

import {
  SHARED_WIKI_CATEGORY_META,
  getSharedWikiArticleBySlug,
  type SharedWikiArticle,
} from './shared-wiki-content';

interface SharedWikiArticleViewProps {
  article: SharedWikiArticle;
  basePath: string;
  buildBasePath: string;
}

function isArticle(value: SharedWikiArticle | undefined): value is SharedWikiArticle {
  return value !== undefined;
}

function SharedWikiArticleView({
  article,
  basePath,
  buildBasePath,
}: SharedWikiArticleViewProps) {
  const categoryMeta = SHARED_WIKI_CATEGORY_META[article.category];
  const relatedArticles = article.relatedSlugs
    .map(getSharedWikiArticleBySlug)
    .filter(isArticle);

  return (
    <article className="flex flex-col gap-12">
      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge badge-accent">{categoryMeta.label}</span>
          <span className="badge badge-neutral">쉬운 설명</span>
        </div>

        <div className="space-y-4">
          <p className="section-label">For Non-Developers</p>
          <h1 className="font-headline text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-[var(--color-text)] md:text-5xl xl:text-[3.15rem]">
            {article.title}
          </h1>
          <p className="max-w-[58rem] text-lg leading-9 text-[var(--color-text-secondary)]">
            {article.summary}
          </p>
        </div>
      </section>

      <div className="flex min-w-0 flex-col gap-8">
        {article.blocks.map((block, index) => (
          <section className="border-t border-[var(--color-border-subtle)] pt-8 first:border-t-0 first:pt-0" key={block.title}>
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="meta">{`SECTION 0${index + 1}`}</p>
                <h2 className="font-headline text-2xl font-bold tracking-tight text-[var(--color-text)] md:text-[2rem]">
                  {block.title}
                </h2>
              </div>

              <div className="grid gap-4">
                {block.paragraphs.map((paragraph) => (
                  <p
                    className="whitespace-pre-wrap text-base leading-8 text-[var(--color-text-secondary)]"
                    key={paragraph}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {block.bullets ? (
                <ul className="grid gap-3 pl-5 text-sm leading-7 text-[var(--color-text-secondary)]">
                  {block.bullets.map((bullet) => (
                    <li className="list-disc" key={bullet}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <section className="workspace-card flex flex-col gap-6">
        <div className="space-y-2">
          <p className="section-label">Need More Detail?</p>
          <h2 className="font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
            구현팀은 기술 위키를 별도로 봅니다
          </h2>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            이 페이지는 팀 공유용 설명층입니다. 컴포넌트 구조, 데이터 흐름, 구현 메모는 별도
            구현용 위키에서 관리합니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link className="btn-secondary text-sm" href={buildBasePath}>
            구현용 위키 열기
          </Link>
        </div>

        {relatedArticles.length > 0 ? (
          <div className="space-y-3 border-t border-[var(--color-border-subtle)] pt-6">
            <p className="section-label">같이 읽으면 좋은 글</p>
            <div className="flex flex-wrap gap-2">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  className="badge badge-neutral transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  href={getWikiArticleHref(basePath, relatedArticle.slug)}
                  key={relatedArticle.slug}
                >
                  {relatedArticle.navLabel}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </article>
  );
}

export { SharedWikiArticleView };
export type { SharedWikiArticleViewProps };
