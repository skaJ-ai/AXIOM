import Link from 'next/link';

import { EntityList } from '@/components/workspace/knowledge/entity-list';
import { FactTimeline } from '@/components/workspace/knowledge/fact-timeline';
import { InsightCards } from '@/components/workspace/knowledge/insight-cards';
import { WorkspacePageHeader } from '@/components/workspace/page-header';
import {
  listEntities,
  listFacts,
  listInsights,
  searchKnowledge,
} from '@/domains/knowledge/queries';
import { requireAuthenticatedPageUser } from '@/lib/auth/middleware';

const RECENT_FACT_LIMIT = 12;
const RECENT_INSIGHT_LIMIT = 8;

export default async function WorkspaceKnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const currentUser = await requireAuthenticatedPageUser();
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() ?? '';

  const [entities, facts, insights, searchResults] = await Promise.all([
    listEntities(currentUser.workspaceId),
    listFacts(currentUser.workspaceId),
    listInsights(currentUser.workspaceId),
    query.length > 0 ? searchKnowledge(currentUser.workspaceId, query) : Promise.resolve(null),
  ]);

  const recentFacts = facts.slice(0, RECENT_FACT_LIMIT);
  const recentInsights = insights.slice(0, RECENT_INSIGHT_LIMIT);

  return (
    <main className="px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <WorkspacePageHeader
          actions={
            <Link className="btn-secondary focus-ring" href="/workspace">
              대시보드로
            </Link>
          }
          description="확정된 보고서에서 자동으로 추출된 엔티티, 사실, 시사점을 한 곳에서 탐색합니다."
          eyebrow="Knowledge Browser"
          meta={
            <>
              <span className="badge badge-accent">엔티티 {entities.length}</span>
              <span className="badge badge-neutral">사실 {facts.length}</span>
              <span className="badge badge-neutral">인사이트 {insights.length}</span>
            </>
          }
          title="조직 지식 브라우저"
        />

        <section className="workspace-card-muted">
          <form
            action="/workspace/knowledge"
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <input
              className="input-surface flex-1"
              defaultValue={query}
              name="q"
              placeholder="엔티티, 사실, 시사점 검색"
              type="search"
            />
            <button className="btn-secondary md:w-fit" type="submit">
              검색
            </button>
          </form>
        </section>

        {searchResults ? (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <p className="meta">Knowledge Search</p>
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                &quot;{query}&quot; 검색 결과
              </h2>
            </div>
            <div className="grid gap-6 xl:grid-cols-3">
              <div className="flex flex-col gap-3">
                <h3 className="font-headline text-base font-bold text-[var(--color-text)]">
                  엔티티 ({searchResults.entities.length})
                </h3>
                <EntityList entities={searchResults.entities} />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="font-headline text-base font-bold text-[var(--color-text)]">
                  사실 ({searchResults.facts.length})
                </h3>
                <FactTimeline facts={searchResults.facts} />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="font-headline text-base font-bold text-[var(--color-text)]">
                  인사이트 ({searchResults.insights.length})
                </h3>
                <InsightCards insights={searchResults.insights} />
              </div>
            </div>
          </section>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
            <section className="flex flex-col gap-4">
              <h2 className="font-headline text-xl font-bold text-[var(--color-text)]">엔티티</h2>
              <EntityList entities={entities} />
            </section>

            <div className="flex flex-col gap-8">
              <section className="flex flex-col gap-4">
                <h2 className="font-headline text-xl font-bold text-[var(--color-text)]">
                  최근 사실
                </h2>
                <FactTimeline facts={recentFacts} />
              </section>

              <section className="flex flex-col gap-4">
                <h2 className="font-headline text-xl font-bold text-[var(--color-text)]">
                  최근 인사이트
                </h2>
                <InsightCards insights={recentInsights} />
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
