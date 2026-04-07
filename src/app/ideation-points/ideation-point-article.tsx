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
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-5 border-b border-[var(--color-border-subtle)] pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge badge-accent">{categoryMeta.label}</span>
          <span className="badge badge-neutral">{article.navLabel}</span>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
            {article.title}
          </h1>
          <p className="max-w-4xl text-lg leading-8 text-[var(--color-text-secondary)]">
            {article.summary}
          </p>
        </div>

        <div className="border-[var(--color-teal)]/20 bg-[var(--color-teal-light)]/60 rounded-[var(--radius-lg)] border p-5">
          <p className="section-label">이식 시 왜 중요한가</p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            {article.whyItMatters}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="section-label">근거 파일</p>
          <div className="grid gap-3 md:grid-cols-2">
            {article.sources.map((source) => (
              <div
                className="workspace-card-muted border border-[var(--color-border-subtle)] px-4 py-4"
                key={`${source.kind}:${source.path}`}
              >
                <span className={`badge ${SOURCE_BADGE_CLASS_NAME[source.kind]}`}>
                  {SOURCE_LABEL[source.kind]}
                </span>
                <p className="mt-3 break-all font-mono text-xs leading-6 text-[var(--color-text-secondary)]">
                  {source.path}
                </p>
              </div>
            ))}
          </div>
        </div>

        {relatedArticles.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="section-label">관련 항목</p>
            <div className="grid gap-3 md:grid-cols-2">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  className="workspace-card-muted flex flex-col gap-2 border border-[var(--color-border-subtle)] px-4 py-4 transition hover:-translate-y-1 hover:border-[var(--color-accent)]"
                  href={`/ideation-points/${relatedArticle.slug}`}
                  key={relatedArticle.slug}
                >
                  <span className="badge badge-neutral w-fit">{relatedArticle.navLabel}</span>
                  <h2 className="text-base font-semibold text-[var(--color-text)]">
                    {relatedArticle.title}
                  </h2>
                  <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                    {relatedArticle.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <div className="flex flex-col gap-8">
        {article.blocks.map((block) => (
          <section className="flex flex-col gap-4" key={block.title}>
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">{block.title}</h2>
            <div className="flex flex-col gap-4">
              {block.paragraphs.map((paragraph) => (
                <p
                  className="whitespace-pre-wrap text-sm leading-8 text-[var(--color-text-secondary)]"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </div>
            {block.bullets ? (
              <ul className="grid gap-3">
                {block.bullets.map((bullet) => (
                  <li
                    className="workspace-card-muted whitespace-pre-wrap border border-[var(--color-border-subtle)] px-4 py-4 text-sm leading-7 text-[var(--color-text-secondary)]"
                    key={bullet}
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}

export { IdeationPointArticleView };
export type { IdeationPointArticleProps };
