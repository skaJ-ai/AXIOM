'use client';

import useSWR from 'swr';

import type { Cluster, Idea } from '@/domains/diverge/types';
import { safeFetch } from '@/lib/utils';

interface DivergePanelProps {
  sessionId: string;
}

interface IdeasResponse {
  data: {
    ideas: Idea[];
  };
}

interface ClustersResponse {
  data: {
    clusters: (Cluster & { ideas: Idea[] })[];
  };
}

const REFRESH_INTERVAL_MS = 5000;

async function fetchJson<T>(url: string): Promise<T> {
  const result = await safeFetch<T>(url);

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

function DivergePanel({ sessionId }: DivergePanelProps) {
  const ideasResult = useSWR<IdeasResponse>(`/api/sessions/${sessionId}/ideas`, fetchJson, {
    refreshInterval: REFRESH_INTERVAL_MS,
  });
  const clustersResult = useSWR<ClustersResponse>(
    `/api/sessions/${sessionId}/clusters`,
    fetchJson,
    { refreshInterval: REFRESH_INTERVAL_MS },
  );

  const ideas = ideasResult.data?.data.ideas ?? [];
  const clusters = clustersResult.data?.data.clusters ?? [];
  const activeIdeas = ideas.filter((idea) => idea.status === 'active');

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold text-[var(--color-text)]">
            아이디어 보드
          </h2>
          <span className="badge badge-mode-diverge">{activeIdeas.length}개</span>
        </div>

        {activeIdeas.length === 0 ? (
          <div className="workspace-card-muted p-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              AI와 대화하면 아이디어가 자동으로 추출됩니다.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {activeIdeas.map((idea) => (
              <div className="workspace-card" key={idea.id}>
                <p className="text-sm leading-6 text-[var(--color-text)]">{idea.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {clusters.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-[var(--color-text)]">클러스터</h2>
            <span className="badge badge-mode-diverge">{clusters.length}개</span>
          </div>

          <div className="grid gap-3">
            {clusters.map((cluster) => (
              <div className="workspace-card" key={cluster.id}>
                <h3 className="mb-2 text-base font-bold text-[var(--color-text)]">
                  {cluster.label}
                </h3>
                {cluster.summary ? (
                  <p className="mb-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {cluster.summary}
                  </p>
                ) : null}
                <div className="flex flex-col gap-2">
                  {cluster.ideas.map((idea) => (
                    <div
                      className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-sunken)] px-3 py-2 text-xs text-[var(--color-text-secondary)]"
                      key={idea.id}
                    >
                      {idea.content}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export { DivergePanel };
export type { DivergePanelProps };
