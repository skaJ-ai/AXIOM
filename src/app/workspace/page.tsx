import Link from 'next/link';

import { DashboardKpiCard } from '@/components/workspace/dashboard-kpi-card';
import { ModeBadge } from '@/components/workspace/mode-badge';
import { WorkspacePageHeader } from '@/components/workspace/page-header';
import { SessionCard } from '@/components/workspace/session-card';
import { requireAuthenticatedPageUser } from '@/lib/auth/middleware';
import { BRAND_NAME } from '@/lib/brand';
import type { SessionMode } from '@/lib/db/schema';
import { listDeliverablesByWorkspace } from '@/lib/deliverables/service';
import { searchWorkspaceContent } from '@/lib/search/service';
import type { WorkspaceSearchResult } from '@/lib/search/types';
import { listSessionsByWorkspace } from '@/lib/sessions/service';

function getSearchKindBadgeLabel(result: WorkspaceSearchResult): string {
  return result.kind === 'deliverable' ? '산출물' : '근거자료';
}

function getSearchMetaLabel(result: WorkspaceSearchResult): string {
  if (result.kind === 'deliverable') {
    return `${result.templateType ?? '보고서'} · ${result.status ?? '초안'}`;
  }

  return `세션 자료 · ${result.sourceType ?? '텍스트'}`;
}

const MODE_QUICKSTART: { description: string; mode: SessionMode; name: string }[] = [
  { description: '흩어진 생각을 구조화', mode: 'diverge', name: '발산' },
  { description: '다양한 관점에서 검토', mode: 'validate', name: '검증' },
  { description: '여러 자료의 핵심 추출', mode: 'synthesize', name: '종합' },
  { description: '정리된 재료로 보고서 작성', mode: 'write', name: '작성' },
];

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const currentUser = await requireAuthenticatedPageUser();
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() ?? '';
  const [sessions, deliverables, searchResults] = await Promise.all([
    listSessionsByWorkspace(currentUser.workspaceId),
    listDeliverablesByWorkspace(currentUser.workspaceId),
    query.length > 0
      ? searchWorkspaceContent({
          query,
          workspaceId: currentUser.workspaceId,
        })
      : Promise.resolve([]),
  ]);
  const recentSessions = sessions.slice(0, 8);
  const recentDeliverables = deliverables.slice(0, 6);
  const sessionsByMode: Record<SessionMode, number> = {
    diverge: 0,
    synthesize: 0,
    validate: 0,
    write: 0,
  };

  for (const session of sessions) {
    sessionsByMode[session.mode] += 1;
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <WorkspacePageHeader
          actions={
            <>
              <Link className="btn-secondary focus-ring" href="/">
                홈으로
              </Link>
              <Link className="btn-teal focus-ring" href="/workspace/new">
                새 작업 시작
              </Link>
            </>
          }
          description="4가지 사고 모드로 생각을 발산·검증·종합하고, 정리된 재료를 다음 작업의 출발점으로 남깁니다."
          eyebrow="조직 사고 워크벤치"
          meta={
            <>
              <span className="badge badge-accent">{currentUser.workspaceName}</span>
              <span className="badge badge-neutral">{currentUser.loginId}</span>
              <span className="badge badge-neutral">사번 {currentUser.employeeNumber}</span>
              <span className="badge badge-neutral">Knox {currentUser.knoxId}</span>
            </>
          }
          title={`${currentUser.name}님의 ${BRAND_NAME} 워크벤치`}
        />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <DashboardKpiCard
            detail={`이번 워크스페이스 ${sessions.length}개`}
            label="세션"
            value={sessions.length}
          />
          <DashboardKpiCard
            detail={`발산 ${sessionsByMode.diverge} · 검증 ${sessionsByMode.validate} · 종합 ${sessionsByMode.synthesize} · 작성 ${sessionsByMode.write}`}
            label="모드 분포"
            value={`${sessionsByMode.diverge + sessionsByMode.validate + sessionsByMode.synthesize + sessionsByMode.write}`}
          />
          <DashboardKpiCard
            detail="누적된 리포트와 산출물"
            label="리포트"
            value={deliverables.length}
          />
          <div className="workspace-card-muted flex flex-col justify-center gap-3">
            <form action="/workspace" className="flex flex-col gap-3">
              <input
                className="input-surface w-full"
                defaultValue={query}
                name="q"
                placeholder="세션, 제목, 키워드 검색"
                type="search"
              />
              <button className="btn-secondary w-full" type="submit">
                전체 검색
              </button>
            </form>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xl font-bold text-[var(--color-text)]">빠른 시작</h2>
            <Link
              className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
              href="/workspace/new"
            >
              새 작업 만들기 →
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {MODE_QUICKSTART.map((entry) => (
              <Link
                className="workspace-card group flex flex-col gap-2 transition hover:-translate-y-1 hover:border-[var(--color-accent)]"
                href="/workspace/new"
                key={entry.mode}
              >
                <ModeBadge label={entry.name} mode={entry.mode} />
                <p className="text-sm text-[var(--color-text-secondary)]">{entry.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {query.length > 0 ? (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <p className="meta">워크스페이스 검색</p>
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                &quot;{query}&quot; 검색 결과
              </h2>
              <span className="badge badge-accent">{searchResults.length}건</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="workspace-card-muted p-6 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  일치하는 산출물이나 근거자료가 없습니다. 다른 키워드로 다시 검색해 주세요.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {searchResults.map((result) => (
                  <Link
                    className="workspace-card group flex flex-col gap-3 transition hover:-translate-y-1 hover:border-[var(--color-accent)] hover:shadow-lg"
                    href={result.href}
                    key={`${result.kind}-${result.id}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-accent">
                          {getSearchKindBadgeLabel(result)}
                        </span>
                        <h3 className="font-headline text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                          {result.title}
                        </h3>
                      </div>
                      <span className="meta">{getSearchMetaLabel(result)}</span>
                    </div>
                    <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                      {result.snippet}
                    </p>
                    <p className="mt-auto text-xs text-[var(--color-text-tertiary)]">
                      업데이트: {result.updatedAt.slice(0, 16).replace('T', ' ')}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xl font-bold text-[var(--color-text)]">
                최근 세션
              </h2>
              <span className="badge badge-neutral">{recentSessions.length}</span>
            </div>

            {recentSessions.length === 0 ? (
              <div className="workspace-card-muted p-6 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  아직 시작한 세션이 없습니다. 위의 빠른 시작에서 모드를 골라 시작해 보세요.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {recentSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xl font-bold text-[var(--color-text)]">
                최근 리포트
              </h2>
              <div className="flex items-center gap-2">
                <Link
                  className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
                  href="/workspace/reports"
                >
                  전체 보기 →
                </Link>
                <span className="badge badge-teal">{recentDeliverables.length}</span>
              </div>
            </div>

            {recentDeliverables.length === 0 ? (
              <div className="workspace-card-muted p-6 text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  아직 생성된 산출물이 없습니다. 작성 모드 세션에서 보고서를 생성해 보세요.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentDeliverables.map((deliverable) => (
                  <Link
                    className="workspace-card group transition hover:border-[var(--color-teal)]"
                    href={`/workspace/asset/${deliverable.id}`}
                    key={deliverable.id}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="meta">{deliverable.templateType ?? 'report'}</span>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-neutral">{deliverable.status}</span>
                        <span className="badge badge-teal font-bold">v{deliverable.version}</span>
                      </div>
                    </div>
                    <h3 className="mb-2 font-headline text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-teal)]">
                      {deliverable.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {deliverable.preview}
                    </p>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
                        {deliverable.updatedAt.slice(0, 16).replace('T', ' ')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
