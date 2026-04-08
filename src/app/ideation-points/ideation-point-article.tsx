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
      <section className="flex flex-col gap-6">
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
            <p className="max-w-[58rem] text-sm leading-7 text-[var(--color-text-secondary)]">
              <span className="section-label mr-3">Why It Matters</span>
              {article.whyItMatters}
            </p>
          </div>
        </div>
      </section>

      <div className="flex min-w-0 flex-col gap-8">
        {article.blocks.map((block, index) => (
          <section className="border-t border-[var(--color-border-subtle)] pt-8 first:border-t-0 first:pt-0" key={block.title}>
            <div className="flex min-w-0 flex-col gap-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="meta">{`SECTION 0${index + 1}`}</span>
                </div>
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
          <p className="section-label">Evidence Trail</p>
          <h2 className="font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
            근거 자료
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {article.sources.map((source) => (
            <div
              className="rounded-[1rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-sunken)] px-4 py-3"
              key={`${source.kind}:${source.path}`}
            >
              <span className={`badge ${SOURCE_BADGE_CLASS_NAME[source.kind]}`}>
                {SOURCE_LABEL[source.kind]}
              </span>
              <p className="mt-2 break-words text-sm leading-6 text-[var(--color-text-secondary)]">
                {source.path}
              </p>
            </div>
          ))}
        </div>

        {relatedArticles.length > 0 ? (
          <div className="space-y-3 border-t border-[var(--color-border-subtle)] pt-6">
            <p className="section-label">Related Notes</p>
            <div className="flex flex-wrap gap-2">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  className="badge badge-neutral transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  href={`/ideation-points/${relatedArticle.slug}`}
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

export { IdeationPointArticleView };
export type { IdeationPointArticleProps };
