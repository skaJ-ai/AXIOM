import Link from 'next/link';

import { getWikiArticleHref } from '@/components/wiki/wiki-paths';

import {
  SHARED_WIKI_ARTICLES,
  SHARED_WIKI_CATEGORY_META,
  SHARED_WIKI_CATEGORY_ORDER,
  SHARED_WIKI_GLOSSARY,
  getSharedWikiArticlesByCategory,
} from './shared-wiki-content';

interface SharedWikiOverviewProps {
  basePath: string;
  buildBasePath: string;
}

const READING_SEQUENCE = [
  {
    description: '제품과 Copilot을 먼저 읽고, 이 플랫폼이 무엇인지 큰 그림부터 잡습니다.',
    slugs: ['what-is-hr-ax-platform', 'what-is-hr-ax-copilot'],
    title: '먼저 큰 그림 보기',
  },
  {
    description:
      '업무 카드, 프로세스, Working Group과 함께 회사 안의 암묵지가 왜 중요한지도 읽습니다.',
    slugs: ['work-card-and-process', 'working-group-role', 'why-tacit-knowledge-matters'],
    title: '일하는 방식 이해하기',
  },
  {
    description: '왜 모든 일을 Agent로 만들지 않는지, 바깥 시스템과는 어떻게 연결되는지 봅니다.',
    slugs: ['why-not-agent-first', 'connectors-and-actions'],
    title: '자동화 원칙 읽기',
  },
  {
    description: '사람 승인 경계, 노하우 충돌 처리, 기록의 중요성을 읽고 운영 관점을 정리합니다.',
    slugs: ['human-approval-boundary', 'how-knowledge-conflicts-are-handled', 'why-records-matter'],
    title: '안심하고 쓰는 조건 이해하기',
  },
];

function SharedWikiOverview({ basePath, buildBasePath }: SharedWikiOverviewProps) {
  const categorySummaries = SHARED_WIKI_CATEGORY_ORDER.map((category) => ({
    articles: getSharedWikiArticlesByCategory(category),
    category,
    meta: SHARED_WIKI_CATEGORY_META[category],
  }));

  return (
    <article className="flex flex-col gap-12">
      <section className="flex flex-col gap-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="badge badge-accent">공유용 위키</span>
            <span className="badge badge-neutral">비개발자 우선</span>
          </div>
          <div className="space-y-4">
            <p className="section-label">For Team Sharing</p>
            <h1 className="text-balance font-headline text-4xl font-extrabold leading-[1.04] tracking-tight text-[var(--color-text)] md:text-5xl xl:text-[3.2rem]">
              HR AX 플랫폼을
              <br />
              <span className="text-[var(--color-accent)]">처음 보는 사람도 따라올 수 있게</span>
              정리한 위키
            </h1>
            <p className="max-w-[64rem] text-lg leading-8 text-[var(--color-text-secondary)]">
              이 위키는 기술 구현보다 “이 플랫폼이 왜 필요한지, 어떻게 일하게 되는지”를 먼저
              이해하게 만드는 설명층입니다. 개발자용 설계 메모는 별도 구현용 위키로 분리했습니다.
            </p>
          </div>
        </div>

        <section className="workspace-card flex flex-col gap-4">
          <p className="section-label">How To Use</p>
          <ul className="grid gap-3 text-sm leading-7 text-[var(--color-text-secondary)]">
            <li>처음 공유할 때는 아래 읽는 순서대로 4개 단계만 먼저 보는 것이 가장 쉽습니다.</li>
            <li>용어가 헷갈리면 아래 용어 사전을 먼저 확인하면 됩니다.</li>
            <li>구현팀이나 개발자는 별도 구현용 위키로 이동하면 됩니다.</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-secondary text-sm" href={buildBasePath}>
              구현용 위키 보기
            </Link>
          </div>
        </section>
      </section>

      <section className="flex flex-col gap-5">
        <div className="space-y-2">
          <p className="section-label">Reading Sequence</p>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
            팀원에게 처음 보여줄 때는 이 순서가 가장 쉽습니다
          </h2>
        </div>
        <div className="grid gap-4">
          {READING_SEQUENCE.map((stage, index) => (
            <article className="workspace-card" key={stage.title}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-5">
                <div className="flex items-center gap-3 lg:min-w-[14rem]">
                  <span className="ideation-stage-badge">{index + 1}</span>
                  <div className="space-y-1">
                    <p className="meta">{`STEP 0${index + 1}`}</p>
                    <h3 className="font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
                      {stage.title}
                    </h3>
                  </div>
                </div>
                <div className="flex min-w-0 flex-col gap-3">
                  <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                    {stage.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stage.slugs.map((slug) => {
                      const article = SHARED_WIKI_ARTICLES.find(
                        (candidate) => candidate.slug === slug,
                      );

                      if (!article) {
                        return null;
                      }

                      return (
                        <Link
                          className="badge badge-neutral transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                          href={getWikiArticleHref(basePath, article.slug)}
                          key={article.slug}
                        >
                          {article.navLabel}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="space-y-2">
          <p className="section-label">Category Map</p>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
            내용을 이렇게 나눠 두면 덜 헷갈립니다
          </h2>
        </div>
        <div className="grid gap-4">
          {categorySummaries.map((categorySummary, index) => (
            <article className="workspace-card" key={categorySummary.category}>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="meta">{`CATEGORY 0${index + 1}`}</p>
                  <span className="badge badge-neutral">{categorySummary.articles.length}개</span>
                </div>
                <h3 className="font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
                  {categorySummary.meta.label}
                </h3>
                <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
                  {categorySummary.meta.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-4">
                {categorySummary.articles.map((article) => (
                  <Link
                    className="badge badge-neutral transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    href={getWikiArticleHref(basePath, article.slug)}
                    key={article.slug}
                  >
                    {article.navLabel}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="space-y-2">
          <p className="section-label">Glossary</p>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">
            자주 나오는 말을 먼저 풀어 둡니다
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {SHARED_WIKI_GLOSSARY.map((item) => (
            <article className="workspace-card" key={item.term}>
              <p className="section-label">{item.term}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}

export { SharedWikiOverview };
export type { SharedWikiOverviewProps };
