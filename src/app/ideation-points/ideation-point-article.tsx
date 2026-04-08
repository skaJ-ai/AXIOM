import Link from 'next/link';

import {
  IDEATION_POINT_CATEGORY_META,
  getIdeationPointBySlug,
  type IdeationPointArticle,
  type IdeationPointSource,
} from './ideation-points-content';

interface IdeationPointArticleProps {
  article: IdeationPointArticle;
}

const SOURCE_BADGE_CLASS_NAME: Record<IdeationPointSource['kind'], string> = {
  code: 'badge-accent',
  draft: 'badge-warning',
  reference: 'badge-neutral',
};

const SOURCE_LABEL: Record<IdeationPointSource['kind'], string> = {
  code: '코드',
  draft: '초안',
  reference: '참고',
};

function isArticle(value: IdeationPointArticle | undefined): value is IdeationPointArticle {
  return value !== undefined;
}

function IdeationPointArticleView({ article }: IdeationPointArticleProps) {
  const categoryMeta = IDEATION_POINT_CATEGORY_META[article.category];
  const relatedArticles = article.relatedSlugs.map(getIdeationPointBySlug).filter(isArticle);

  return (
    <article className="flex flex-col gap-12">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge badge-accent">{categoryMeta.label}</span>
            <span className="badge badge-neutral">{article.navLabel}</span>
            <span className="badge badge-neutral">{article.sources.length}개 근거</span>
          </div>

          <div className="space-y-4">
            <p className="section-label">Transferable Design Decision</p>
            <h1 className="font-headline text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-[var(--color-text)] md:text-5xl xl:text-[3.4rem]">
              {article.title}
            </h1>
            <p className="max-w-[58rem] text-lg leading-9 text-[var(--color-text-secondary)]">
              {article.summary}
            </p>
          </div>
        </div>

        <aside className="wiki-panel-muted flex h-fit flex-col gap-3 p-6">
          <p className="section-label">Why It Matters</p>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            {article.whyItMatters}
          </p>
        </aside>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          {article.blocks.map((block, index) => (
            <section className="wiki-panel-muted px-6 py-6 lg:px-8 lg:py-7" key={block.title}>
              <div className="grid gap-5 xl:grid-cols-[72px_minmax(0,1fr)]">
                <div className="hidden xl:flex xl:items-start xl:justify-center">
                  <span className="meta pt-1 text-[0.8rem] font-bold">{`0${index + 1}`}</span>
                </div>

                <div className="flex min-w-0 flex-col gap-5">
                  <div className="space-y-3">
                    <p className="section-label">{`Section 0${index + 1}`}</p>
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
                    <ul className="grid gap-3 lg:grid-cols-2">
                      {block.bullets.map((bullet) => (
                        <li
                          className="rounded-[1.25rem] bg-white/84 px-5 py-4 text-sm leading-7 text-[var(--color-text-secondary)] shadow-[var(--shadow-1)]"
                          key={bullet}
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </section>
          ))}
        </div>

        <aside className="flex flex-col gap-5 xl:sticky xl:top-6 xl:self-start">
          <section className="wiki-panel-muted flex flex-col gap-4 p-6">
              <div className="space-y-2">
                <p className="section-label">Evidence Trail</p>
                <h2 className="font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
                  근거 자료
                </h2>
              </div>

            <div className="grid gap-3">
              {article.sources.map((source) => (
                <div
                  className="rounded-[1.25rem] bg-white/82 px-4 py-4 shadow-[var(--shadow-1)]"
                  key={`${source.kind}:${source.path}`}
                >
                  <span className={`badge ${SOURCE_BADGE_CLASS_NAME[source.kind]}`}>
                    {SOURCE_LABEL[source.kind]}
                  </span>
                  <p className="mt-3 break-words text-sm leading-6 text-[var(--color-text-secondary)]">
                    {source.path}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {relatedArticles.length > 0 ? (
            <section className="wiki-panel-muted flex flex-col gap-4 p-6">
              <div className="space-y-2">
                <p className="section-label">Related Notes</p>
                <h2 className="font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
                  관련 항목
                </h2>
              </div>

              <div className="grid gap-3">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    className="rounded-[1.25rem] bg-white/82 px-4 py-4 shadow-[var(--shadow-1)] transition hover:-translate-y-0.5 hover:text-[var(--color-accent)]"
                    href={`/ideation-points/${relatedArticle.slug}`}
                    key={relatedArticle.slug}
                  >
                    <span className="badge badge-neutral w-fit">{relatedArticle.navLabel}</span>
                    <h3 className="mt-3 font-headline text-lg font-bold tracking-tight text-[var(--color-text)]">
                      {relatedArticle.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                      {relatedArticle.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}

export { IdeationPointArticleView };
export type { IdeationPointArticleProps };
