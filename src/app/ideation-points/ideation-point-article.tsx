import type { IdeationPointArticle } from './ideation-points-content';

interface IdeationPointArticleProps {
  article: IdeationPointArticle;
}

function IdeationPointArticleView({ article }: IdeationPointArticleProps) {
  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-5 border-b border-[var(--color-border-subtle)] pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge badge-accent">위키 항목</span>
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
          <p className="section-label">왜 중요한가</p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            {article.whyItMatters}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="section-label">근거 코드</p>
          <div className="flex flex-wrap gap-2">
            {article.sourcePaths.map((sourcePath) => (
              <span className="badge badge-neutral" key={sourcePath}>
                {sourcePath}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        {article.blocks.map((block) => (
          <section className="flex flex-col gap-4" key={block.title}>
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">{block.title}</h2>
            <div className="flex flex-col gap-4">
              {block.paragraphs.map((paragraph) => (
                <p className="text-sm leading-8 text-[var(--color-text-secondary)]" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
            {block.bullets ? (
              <ul className="grid gap-3">
                {block.bullets.map((bullet) => (
                  <li
                    className="workspace-card-muted border border-[var(--color-border-subtle)] px-4 py-4 text-sm leading-7 text-[var(--color-text-secondary)]"
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
